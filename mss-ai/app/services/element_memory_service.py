"""
Serviço de gerenciamento de memória de elementos.
Rastreia elementos ao longo do tempo para evitar regressão falsa de progresso.
"""

from datetime import datetime

import structlog
from pynamodb.exceptions import DoesNotExist

from app.models.dynamodb import ProjectElementMemory

logger = structlog.get_logger(__name__)


class ElementLifecycle:
    """Classificação de ciclo de vida de elementos."""

    PERMANENT = "permanent"  # Estrutural: column, beam, slab, foundation, roof, wall
    TEMPORARY = "temporary"  # Temporário: scaffold, formwork, equipment, fence
    FINISHING = "finishing"  # Acabamento: door, window, covering, railing
    UNKNOWN = "unknown"

    @classmethod
    def classify(cls, element_type: str) -> str:
        """Classifica elemento por tipo."""
        element_type_lower = element_type.lower()

        permanent_types = {
            "column", "beam", "slab", "foundation", "roof",
            "wall", "structure", "footing", "pile"
        }

        temporary_types = {
            "scaffold", "formwork", "equipment", "fence",
            "barrier", "support", "temporary"
        }

        finishing_types = {
            "door", "window", "covering", "railing",
            "stair", "curtainwall", "panel", "floor"
        }

        if element_type_lower in permanent_types:
            return cls.PERMANENT
        if element_type_lower in temporary_types:
            return cls.TEMPORARY
        if element_type_lower in finishing_types:
            return cls.FINISHING
        return cls.UNKNOWN


class ElementStatus:
    """Status atual de um elemento."""

    VISIBLE = "visible"  # Visível na foto
    HIDDEN = "hidden"  # Oculto por outros elementos
    REMOVED = "removed"  # Removido (demolição/erro)


class ElementMemoryService:
    """Gerencia memória de elementos por projeto."""

    def __init__(self):
        self.logger = logger

    def get_or_create_memory(
        self, project_id: str, element_type: str, count: int, timestamp: str
    ) -> ProjectElementMemory:
        """Busca ou cria memória de elemento."""
        memory_id = f"{project_id}#{element_type.lower()}"

        try:
            memory = ProjectElementMemory.get(memory_id)
            self.logger.debug("memoria_encontrada", memory_id=memory_id)
            return memory
        except DoesNotExist:
            lifecycle = ElementLifecycle.classify(element_type)
            memory = ProjectElementMemory(
                memory_id=memory_id,
                project_id=project_id,
                element_type=element_type.lower(),
                lifecycle=lifecycle,
                first_detected_at=timestamp,
                last_seen_at=timestamp,
                max_count_seen=count,
                current_count=count,
                current_status=ElementStatus.VISIBLE,
                times_detected=1,
                times_hidden=0,
                confidence_level="medium",
            )
            memory.save()
            self.logger.info(
                "memoria_criada",
                memory_id=memory_id,
                lifecycle=lifecycle,
                count=count
            )
            return memory

    def update_memory(
        self,
        project_id: str,
        element_type: str,
        current_count: int,
        timestamp: str,
        covering_elements: list[str] | None = None
    ) -> dict:
        """Atualiza memória de elemento e detecta mudanças."""
        memory = self.get_or_create_memory(project_id, element_type, current_count, timestamp)

        previous_count = memory.current_count
        previous_status = memory.current_status
        max_count = memory.max_count_seen

        # Atualizar contadores
        if current_count > 0:
            memory.last_seen_at = timestamp
            memory.times_detected += 1
            memory.max_count_seen = max(max_count, current_count)
            memory.current_count = current_count
            memory.current_status = ElementStatus.VISIBLE
        else:
            # Elemento não visível
            memory.times_hidden += 1

            # Lógica de status baseada em lifecycle
            if memory.lifecycle == ElementLifecycle.PERMANENT:
                # Permanente: provavelmente oculto
                memory.current_status = ElementStatus.HIDDEN

                # Detectar cobertura
                if covering_elements:
                    memory.likely_covered_by = covering_elements
                    memory.confidence_level = "high"
                    memory.notes = f"Provavelmente coberto por {', '.join(covering_elements)}"
                else:
                    memory.confidence_level = "medium"
                    memory.notes = "Não visível mas estrutura permanente mantida"

            elif memory.lifecycle == ElementLifecycle.TEMPORARY:
                # Temporário: ok remover
                memory.current_status = ElementStatus.REMOVED
                memory.current_count = 0
                memory.notes = "Elemento temporário removido (esperado)"

            else:
                # Desconhecido: investigar
                memory.current_status = ElementStatus.HIDDEN
                memory.confidence_level = "low"
                memory.notes = "Status incerto - requer revisão"

        memory.save()

        # Preparar resultado
        result = {
            "element_type": element_type,
            "lifecycle": memory.lifecycle,
            "previous_count": previous_count,
            "current_count_visible": current_count,
            "effective_count": memory.current_count,  # Pode manter count mesmo se não visível
            "previous_status": previous_status,
            "current_status": memory.current_status,
            "max_count_seen": memory.max_count_seen,
            "confidence_level": memory.confidence_level,
            "notes": memory.notes or "",
            "contributes_to_progress": memory.current_status != ElementStatus.REMOVED
        }

        self.logger.info(
            "memoria_atualizada",
            element_type=element_type,
            prev_count=previous_count,
            curr_count=current_count,
            status=memory.current_status,
            contributes=result["contributes_to_progress"]
        )

        return result

    def get_project_memory(self, project_id: str) -> dict[str, ProjectElementMemory]:
        """Retorna toda memória do projeto."""
        try:
            memories = ProjectElementMemory.project_id_index.query(project_id)
            result = {m.element_type: m for m in memories}
            self.logger.debug("memoria_projeto_carregada", project_id=project_id, count=len(result))
            return result
        except Exception as e:
            self.logger.warning("erro_carregar_memoria", project_id=project_id, error=str(e))
            return {}

    def process_analysis_with_memory(
        self,
        project_id: str,
        detected_elements: list[dict],
        timestamp: str | None = None
    ) -> dict:
        """
        Processa análise considerando memória de elementos.
        Retorna elementos ajustados e metadados de mudanças.
        """
        if timestamp is None:
            timestamp = datetime.utcnow().isoformat()

        # Carregar memória existente
        memory_dict = self.get_project_memory(project_id)

        # Agrupar elementos detectados por tipo
        detected_by_type = {}
        covering_types = []  # Elementos que podem cobrir outros

        for elem in detected_elements:
            elem_type = elem.get("element_type", "").lower()
            count_visible = elem.get("count_visible", 1)
            detected_by_type[elem_type] = count_visible

            # Detectar elementos de cobertura
            if elem_type in ["wall", "covering", "slab", "roof", "panel"]:
                covering_types.append(elem_type)

        # Processar cada tipo de elemento na memória
        adjusted_elements = []
        memory_updates = []

        # Elementos detectados agora
        for elem_type, count in detected_by_type.items():
            update = self.update_memory(
                project_id=project_id,
                element_type=elem_type,
                current_count=count,
                timestamp=timestamp,
                covering_elements=covering_types if count == 0 else None
            )
            memory_updates.append(update)

            # Adicionar elemento ajustado
            adjusted_elements.append({
                "element_type": elem_type,
                "count_visible": count,
                "effective_count": update["effective_count"],
                "status": update["current_status"],
                "contributes_to_progress": update["contributes_to_progress"]
            })

        # Elementos na memória mas não detectados agora
        for elem_type, memory in memory_dict.items():
            if elem_type not in detected_by_type:
                # Não foi detectado nesta análise
                update = self.update_memory(
                    project_id=project_id,
                    element_type=elem_type,
                    current_count=0,
                    timestamp=timestamp,
                    covering_elements=covering_types
                )
                memory_updates.append(update)

                # Se permanente e oculto, mantém no progresso
                if update["contributes_to_progress"]:
                    adjusted_elements.append({
                        "element_type": elem_type,
                        "count_visible": 0,
                        "effective_count": update["effective_count"],
                        "status": update["current_status"],
                        "contributes_to_progress": True
                    })

        result = {
            "adjusted_elements": adjusted_elements,
            "memory_updates": memory_updates,
            "covering_elements_detected": covering_types
        }

        self.logger.info(
            "analise_processada_com_memoria",
            project_id=project_id,
            elementos_ajustados=len(adjusted_elements),
            elementos_ocultos=sum(1 for e in adjusted_elements if e["status"] == ElementStatus.HIDDEN),
            elementos_permanentes=sum(1 for u in memory_updates if u["lifecycle"] == ElementLifecycle.PERMANENT)
        )

        return result

    def clear_project_memory(self, project_id: str) -> int:
        """Limpa memória de um projeto."""
        count = 0
        try:
            memories = ProjectElementMemory.project_id_index.query(project_id)
            for _memory in memories:
                _memory.delete()
                count += 1
            self.logger.info("memoria_limpa", project_id=project_id, count=count)
        except Exception as e:
            self.logger.error("erro_limpar_memoria", project_id=project_id, error=str(e))
        return count
