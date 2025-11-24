"""Serviço para cálculo de progresso de construção.

Implementa lógica híbrida com 3 casos baseada em mapping_ratio:
- CASO 1: Sem BIM (expected vazio) → Progresso = 100% para detectados
- CASO 2: Com BIM mas matching fraco (<50%) → Usa contagem total
- CASO 3: Com BIM e matching bom (≥50%) → Progresso por categoria
"""

import structlog
from collections import defaultdict

from app.schemas.bim import ProgressStatus

logger = structlog.get_logger(__name__)


class ProgressCalculator:
    """Serviço responsável por calcular métricas de progresso com lógica híbrida."""

    def calculate_progress_metrics(
        self, 
        detected_elements: list[dict], 
        all_elements: list[dict],
        adjusted_elements: list[dict] | None = None
    ) -> dict:
        """
        Calcula métricas de progresso da obra usando lógica híbrida.

        Args:
            detected_elements: Elementos detectados na análise
            all_elements: Todos os elementos do projeto BIM (expected)
            adjusted_elements: Elementos ajustados com memória (opcional)

        Returns:
            Dicionário com métricas de progresso
        """
        # CASO 1: Sem BIM (expected vazio)
        if not all_elements:
            logger.info("caso_1_sem_bim", detected_count=len(detected_elements))
            return {
                "overall_progress": 100.0 if detected_elements else 0.0,
                "detected_count": len(detected_elements),
                "expected_count": 0,
                "progress_mode": "no_bim",
                "message": "Progresso baseado apenas em elementos detectados (sem modelo BIM)"
            }

        # Usa adjusted_elements se disponível, senão detected_elements
        elements_to_use = adjusted_elements if adjusted_elements else detected_elements
        
        # Calcula progresso por categoria e mapping ratio
        progress_report = self.compute_progress_report(
            detected_elements=elements_to_use,
            all_elements=all_elements
        )
        
        return progress_report

    def compute_progress_report(
        self,
        detected_elements: list[dict],
        all_elements: list[dict]
    ) -> dict:
        """
        Calcula relatório de progresso com lógica híbrida de 3 casos.
        
        CASO 1: Sem BIM → Progresso = 100% detectados
        CASO 2: Matching fraco (<50%) → Usa contagem total agregada
        CASO 3: Matching bom (≥50%) → Progresso por categoria
        
        Args:
            detected_elements: Elementos detectados (ou ajustados com memória)
            all_elements: Todos os elementos esperados do BIM
            
        Returns:
            Relatório completo de progresso
        """
        # Contagens totais
        total_expected = len(all_elements)
        
        # Calcula visual built (considera effective_count se disponível)
        visual_built = self.compute_visual_built(detected_elements)
        total_built = visual_built["total_count"]
        
        # Agrupa expected por tipo
        expected_by_type = defaultdict(int)
        for elem in all_elements:
            element_type = elem.get("element_type", "unknown").lower()
            expected_by_type[element_type] += 1
        
        # Agrupa detected/built por tipo (com effective_count se disponível)
        built_by_type = defaultdict(int)
        for elem in detected_elements:
            element_type = elem.get("element_type", "unknown").lower()
            # Se tiver effective_count (da memória), usar; senão, contar 1
            count = elem.get("effective_count", 1)
            built_by_type[element_type] += count
        
        # Calcula progresso por categoria
        progress_by_category = {}
        total_built_from_categories = 0
        
        for elem_type, expected_count in expected_by_type.items():
            built_count = built_by_type.get(elem_type, 0)
            total_built_from_categories += built_count
            
            progress_percent = (built_count / expected_count * 100) if expected_count > 0 else 0.0
            
            progress_by_category[elem_type] = {
                "built": built_count,
                "expected": expected_count,
                "progress_percent": round(progress_percent, 2)
            }
        
        # Calcula mapping_ratio (% de elementos detectados que foram mapeados ao BIM)
        mapping_ratio = (total_built_from_categories / total_built) if total_built > 0 else 0.0
        
        # DECISÃO: Qual caso usar?
        if mapping_ratio < 0.5:
            # CASO 2: Matching fraco - usa contagem total agregada
            logger.warning(
                "matching_fraco_detectado",
                mapping_ratio=round(mapping_ratio, 3),
                total_built=total_built,
                total_mapped=total_built_from_categories,
                total_expected=total_expected
            )
            
            # Limpa progresso por categoria e cria entrada agregada
            progress_by_category.clear()
            progress_by_category["elementos_detectados"] = {
                "built": total_built,
                "expected": total_expected,
                "progress_percent": round((total_built / total_expected * 100), 2) if total_expected > 0 else 0.0
            }
            
            overall_progress = (total_built / total_expected * 100) if total_expected > 0 else 0.0
            progress_mode = "weak_matching"
            
        else:
            # CASO 3: Matching bom - progresso por categoria
            logger.info(
                "matching_bom_detectado",
                mapping_ratio=round(mapping_ratio, 3),
                total_built_from_categories=total_built_from_categories,
                total_expected=total_expected
            )
            
            # Progresso geral ponderado por categoria
            overall_progress = (total_built_from_categories / total_expected * 100) if total_expected > 0 else 0.0
            progress_mode = "category_based"
        
        return {
            "overall_progress": round(overall_progress, 2),
            "progress_by_category": progress_by_category,
            "total_built": total_built,
            "total_expected": total_expected,
            "mapping_ratio": round(mapping_ratio, 3),
            "progress_mode": progress_mode,
            "detected_count": len(detected_elements),
        }
    
    def compute_visual_built(self, detected_elements: list[dict]) -> dict:
        """
        Calcula contagem de elementos construídos visualmente.
        
        Considera effective_count de elementos da memória (quando ocultos mas permanentes).
        
        Args:
            detected_elements: Elementos detectados ou ajustados
            
        Returns:
            Contagens por tipo e total
        """
        built_by_type = defaultdict(int)
        total_count = 0
        
        for elem in detected_elements:
            element_type = elem.get("element_type", "unknown").lower()
            
            # Se elemento tem effective_count (da memória), usar esse valor
            # Isso permite que elementos ocultos mas permanentes mantenham contagem
            count = elem.get("effective_count", 1)
            
            built_by_type[element_type] += count
            total_count += count
        
        return {
            "by_type": dict(built_by_type),
            "total_count": total_count
        }

    def calculate_overall_progress(self, detected_elements: list[dict]) -> float:
        """
        Calcula progresso geral baseado nos elementos detectados.

        Args:
            detected_elements: Lista de elementos detectados

        Returns:
            Progresso percentual (0-100)
        """
        if not detected_elements:
            return 0.0

        total = len(detected_elements)
        completed = sum(1 for e in detected_elements if e.get("status") == ProgressStatus.COMPLETED)
        in_progress = sum(1 for e in detected_elements if e.get("status") == ProgressStatus.IN_PROGRESS)

        # Peso: completo = 1.0, em progresso = 0.5
        weighted = (completed * 1.0 + in_progress * 0.5) / total * 100

        return round(weighted, 2)

    def identify_alerts(self, detected_elements: list[dict], project_data: dict) -> list[str]:
        """
        Identifica alertas baseado na análise.

        Args:
            detected_elements: Elementos detectados
            project_data: Dados do projeto BIM

        Returns:
            Lista de alertas identificados
        """
        alerts = []
        all_elements = project_data.get("elements", [])

        detected_ids = {e.get("element_id") for e in detected_elements}

        for element in all_elements:
            if element["element_id"] not in detected_ids:
                alerts.append(
                    f"{element['element_type']} ({element.get('name', 'sem nome')}) não identificado na imagem"
                )

        for element in detected_elements:
            if element.get("deviation"):
                alerts.append(f"Desvio em {element['element_type']}: {element['deviation']}")

        return alerts
    
    def calculate_progress_evolution(
        self,
        analyses: list[dict],
        all_elements: list[dict]
    ) -> dict:
        """
        Calcula evolução do progresso ao longo do tempo.
        
        Args:
            analyses: Lista de análises ordenadas por data
            all_elements: Elementos esperados do BIM
            
        Returns:
            Timeline com evolução do progresso
        """
        timeline = []
        
        for analysis in analyses:
            detected_elements = analysis.get("detected_elements", [])
            analyzed_at = analysis.get("analyzed_at", "")
            
            # Calcula progresso para esta análise
            progress_metrics = self.calculate_progress_metrics(
                detected_elements=detected_elements,
                all_elements=all_elements
            )
            
            timeline.append({
                "date": analyzed_at,
                "analysis_id": analysis.get("analysis_id"),
                "overall_progress": progress_metrics.get("overall_progress", 0.0),
                "progress_mode": progress_metrics.get("progress_mode", "unknown"),
                "detected_count": len(detected_elements),
                "progress_by_category": progress_metrics.get("progress_by_category", {})
            })
        
        # Calcula taxa de progresso (delta entre primeira e última)
        progress_rate = 0.0
        if len(timeline) >= 2:
            first_progress = timeline[0]["overall_progress"]
            last_progress = timeline[-1]["overall_progress"]
            progress_rate = last_progress - first_progress
        
        return {
            "timeline": timeline,
            "total_analyses": len(timeline),
            "progress_rate": round(progress_rate, 2),
            "current_progress": timeline[-1]["overall_progress"] if timeline else 0.0
        }
    
    def compare_progress(
        self,
        current_analysis: dict,
        previous_analysis: dict,
        all_elements: list[dict]
    ) -> dict:
        """
        Compara progresso entre duas análises.
        
        Args:
            current_analysis: Análise atual
            previous_analysis: Análise anterior
            all_elements: Elementos esperados do BIM
            
        Returns:
            Comparação detalhada entre análises
        """
        current_elements = current_analysis.get("detected_elements", [])
        previous_elements = previous_analysis.get("detected_elements", [])
        
        # Calcula progresso para ambas
        current_progress = self.calculate_progress_metrics(
            detected_elements=current_elements,
            all_elements=all_elements
        )
        
        previous_progress = self.calculate_progress_metrics(
            detected_elements=previous_elements,
            all_elements=all_elements
        )
        
        # Delta de progresso
        progress_delta = current_progress["overall_progress"] - previous_progress["overall_progress"]
        
        # Identifica novos elementos
        previous_ids = {e.get("element_id") for e in previous_elements}
        current_ids = {e.get("element_id") for e in current_elements}
        
        new_elements = current_ids - previous_ids
        removed_elements = previous_ids - current_ids
        
        # Mudanças por categoria
        category_changes = {}
        current_categories = current_progress.get("progress_by_category", {})
        previous_categories = previous_progress.get("progress_by_category", {})
        
        all_categories = set(current_categories.keys()) | set(previous_categories.keys())
        
        for category in all_categories:
            current_cat = current_categories.get(category, {"progress_percent": 0.0})
            previous_cat = previous_categories.get(category, {"progress_percent": 0.0})
            
            delta = current_cat["progress_percent"] - previous_cat["progress_percent"]
            
            if delta != 0:
                category_changes[category] = {
                    "previous_progress": previous_cat["progress_percent"],
                    "current_progress": current_cat["progress_percent"],
                    "delta": round(delta, 2)
                }
        
        return {
            "progress_delta": round(progress_delta, 2),
            "current_progress": current_progress["overall_progress"],
            "previous_progress": previous_progress["overall_progress"],
            "new_elements_count": len(new_elements),
            "removed_elements_count": len(removed_elements),
            "category_changes": category_changes,
            "comparison_date": current_analysis.get("analyzed_at", ""),
            "baseline_date": previous_analysis.get("analyzed_at", "")
        }
