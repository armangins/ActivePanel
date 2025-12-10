import { useState, useCallback, useEffect } from 'react';
import { attributesAPI } from '../../../../../../services/woocommerce';
import { useAttributesData, useAttributeTerms } from '../../../../../../hooks/useAttributes';

/**
 * Custom hook for managing product attributes and terms
 * @returns {Object} - Attributes state and handlers
 */
export const useAttributes = () => {
  // Use cached attributes data
  const { data: cachedAttributes, isLoading: isLoadingAttributes } = useAttributesData();

  const [attributes, setAttributes] = useState([]);
  const [attributeTerms, setAttributeTerms] = useState({});
  const [selectedAttributeIds, setSelectedAttributeIds] = useState([]);
  const [selectedAttributeTerms, setSelectedAttributeTerms] = useState({});
  const [originalProductAttributes, setOriginalProductAttributes] = useState([]);
  const [attributeErrors, setAttributeErrors] = useState({});

  // Sync cached attributes to local state when loaded
  useEffect(() => {
    if (cachedAttributes) {
      setAttributes(cachedAttributes);
    }
  }, [cachedAttributes]);

  const loadAttributes = useCallback(async (productType) => {
    // Attributes are now loaded via useQuery (cachedAttributes)
    // This function is kept for compatibility but doesn't need to fetch
    if (productType !== 'variable') {
      return;
    }
    // If we needed to trigger a refetch, we would use the query client, 
    // but for now we rely on the background sync of useQuery
  }, []);

  const loadAttributeTerms = useCallback(async (attributeId) => {
    // Only load terms if not already loaded (undefined means not loaded yet)
    if (attributeTerms[attributeId] !== undefined) return;

    try {
      // Clear any previous error
      setAttributeErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[attributeId];
        return newErrors;
      });

      const terms = await attributesAPI.getTerms(attributeId);

      setAttributeTerms(prev => ({
        ...prev,
        [attributeId]: terms || []
      }));
    } catch (err) {
      console.error(`Error loading terms for attribute ${attributeId}:`, err);
      setAttributeErrors(prev => ({
        ...prev,
        [attributeId]: err.message || 'Failed to load values'
      }));
      setAttributeTerms(prev => ({
        ...prev,
        [attributeId]: [] // Set empty to stop loading state
      }));
    }
  }, [attributeTerms]);

  const toggleAttribute = useCallback(async (attributeId) => {
    setSelectedAttributeIds(prev => {
      if (prev.includes(attributeId)) {
        // Remove attribute and clear its selected terms
        setSelectedAttributeTerms(prevTerms => {
          const newTerms = { ...prevTerms };
          delete newTerms[attributeId];
          return newTerms;
        });
        return prev.filter(id => id !== attributeId);
      } else {
        // Load terms when attribute is selected
        loadAttributeTerms(attributeId);
        return [...prev, attributeId];
      }
    });
  }, [loadAttributeTerms]);

  const toggleAttributeTerm = useCallback((attributeId, termId) => {
    setSelectedAttributeTerms(prev => {
      const currentTerms = prev[attributeId] || [];
      const newTerms = currentTerms.includes(termId)
        ? currentTerms.filter(id => id !== termId)
        : [...currentTerms, termId];

      return {
        ...prev,
        [attributeId]: newTerms.length > 0 ? newTerms : undefined
      };
    });
  }, []);

  const isAttributeSelected = useCallback((attributeId) => {
    return selectedAttributeIds.includes(attributeId);
  }, [selectedAttributeIds]);

  const isTermSelected = useCallback((attributeId, termId) => {
    return selectedAttributeTerms[attributeId]?.includes(termId) || false;
  }, [selectedAttributeTerms]);

  const clearAttributes = useCallback(() => {
    setAttributes([]);
    setAttributeTerms({});
    setSelectedAttributeIds([]);
    setSelectedAttributeTerms({});
  }, []);

  const resetAttributes = useCallback(() => {
    clearAttributes();
    setOriginalProductAttributes([]);
  }, [clearAttributes]);

  return {
    attributes,
    attributeTerms,
    selectedAttributeIds,
    selectedAttributeTerms,
    loadingAttributes: isLoadingAttributes,
    originalProductAttributes,
    setAttributes,
    setAttributeTerms,
    setSelectedAttributeIds,
    setSelectedAttributeTerms,
    setOriginalProductAttributes,
    loadAttributes,
    loadAttributeTerms,
    toggleAttribute,
    toggleAttributeTerm,
    isAttributeSelected,
    isTermSelected,
    clearAttributes,
    resetAttributes,
    attributeErrors,
    loadAttributeTerms // Expose for retry
  };
};





