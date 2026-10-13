import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { documentService } from '../services/documentService';
import { useAuth } from './AuthContext';

const StudyContext = createContext();

export const StudyProvider = ({ children }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [activeDocument, setActiveDocument] = useState(null);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [activeTest, setActiveTest] = useState(null);

  const fetchDocuments = useCallback(async () => {
    if (!user) {
      setDocuments([]);
      setActiveDocument(null);
      return;
    }
    try {
      setLoadingDocs(true);
      const docs = await documentService.listDocuments();
      setDocuments(docs);
      if (docs && docs.length > 0) {
        setActiveDocument((prev) => {
          if (prev && docs.some(d => d.id === prev.id)) {
            return prev;
          }
          return docs[0];
        });
      } else {
        setActiveDocument(null);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
      setDocuments([]);
      setActiveDocument(null);
    } finally {
      setLoadingDocs(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    } else {
      setDocuments([]);
      setActiveDocument(null);
      setActiveTest(null);
    }
  }, [user, fetchDocuments]);

  const selectDocument = (doc) => {
    setActiveDocument(doc);
  };

  return (
    <StudyContext.Provider
      value={{
        documents,
        activeDocument,
        setActiveDocument,
        selectDocument,
        loadingDocs,
        fetchDocuments,
        activeTest,
        setActiveTest,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => useContext(StudyContext);
