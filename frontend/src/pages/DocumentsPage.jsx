import React, { useState } from 'react';
import { Files, UploadCloud, FileText, Search, Trash2, CheckCircle2 } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { documentService } from '../services/documentService';
import PDFUploader from '../components/PDFUploader';
import DocumentCard from '../components/DocumentCard';

export default function DocumentsPage() {
  const { documents, fetchDocuments } = useStudy();
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this study document and its vector embeddings?')) return;
    try {
      setDeletingId(docId);
      await documentService.deleteDocument(docId);
      await fetchDocuments();
    } catch (err) {
      console.error(err);
      alert('Failed to delete document.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDocs = documents.filter((d) =>
    d.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-on-surface tracking-tight flex items-center gap-2">
          <Files className="w-6 h-6 text-primary" />
          Study Materials & Vector Database
        </h1>
        <p className="text-xs text-on-surface-variant mt-1 font-sans">
          Manage your uploaded textbooks, lecture notes, and question banks. Documents are automatically parsed, chunked, and embedded into the Chroma vector store.
        </p>
      </div>

      {/* Upload Box */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold text-on-surface uppercase tracking-wider">Upload New Document</h3>
        <PDFUploader />
      </div>

      {/* Documents Library */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-sm font-heading font-bold text-on-surface uppercase tracking-wider">
            Indexed Documents ({documents.length})
          </h3>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-outline absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full bg-surface-lowest text-on-surface text-xs pl-9 pr-3 py-2 rounded-xl border border-white/[0.12] focus:outline-none focus:border-primary transition font-sans placeholder:text-outline"
            />
          </div>
        </div>

        {filteredDocs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocs.map((doc) => (
              <DocumentCard key={doc.id} document={doc} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-2xl bg-surface-container-low border border-white/[0.08] text-center space-y-2">
            <FileText className="w-8 h-8 text-outline mx-auto" />
            <p className="text-sm text-outline font-sans">
              {searchQuery ? 'No documents match your search.' : 'No study documents uploaded yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
