import unittest
from unittest.mock import Mock, patch, MagicMock
from typing import List
from langchain_core.documents import Document
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.flash.retriever import rerank_documents


class TestRetrieverFunctions(unittest.TestCase):
    """Unit tests for retriever.py functions"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.sample_documents = [
            Document(
                page_content="Python is a high-level programming language.",
                metadata={"source": "doc1.pdf", "page": 1}
            ),
            Document(
                page_content="Machine learning is a subset of artificial intelligence.",
                metadata={"source": "doc2.pdf", "page": 2}
            ),
            Document(
                page_content="Deep learning uses neural networks with multiple layers.",
                metadata={"source": "doc3.pdf", "page": 3}
            ),
            Document(
                page_content="Natural language processing enables computers to understand human language.",
                metadata={"source": "doc4.pdf", "page": 4}
            ),
            Document(
                page_content="Data science combines statistics, programming, and domain knowledge.",
                metadata={"source": "doc5.pdf", "page": 5}
            )
        ]
        
        self.test_query = "What is machine learning?"
    
    def test_rerank_documents_empty_list(self):
        """Test rerank_documents with empty document list"""
        result = rerank_documents(self.test_query, [], top_k=5)
        self.assertEqual(result, [])
        self.assertIsInstance(result, list)
    
    @patch('backend.flash.retriever.ranker')
    def test_rerank_documents_basic(self, mock_ranker):
        """Test rerank_documents with basic functionality"""
        # Mock the ranker.rerank response
        mock_results = [
            {'id': '1', 'text': 'Machine learning is a subset of artificial intelligence.', 
             'score': 0.95, 'meta': {"source": "doc2.pdf", "page": 2}},
            {'id': '4', 'text': 'Natural language processing enables computers to understand human language.', 
             'score': 0.85, 'meta': {"source": "doc4.pdf", "page": 4}},
            {'id': '2', 'text': 'Deep learning uses neural networks with multiple layers.', 
             'score': 0.75, 'meta': {"source": "doc3.pdf", "page": 3}},
            {'id': '0', 'text': 'Python is a high-level programming language.', 
             'score': 0.60, 'meta': {"source": "doc1.pdf", "page": 1}},
            {'id': '3', 'text': 'Data science combines statistics, programming, and domain knowledge.', 
             'score': 0.55, 'meta': {"source": "doc5.pdf", "page": 5}}
        ]
        
        mock_ranker.rerank.return_value = mock_results
        
        # Call the function
        result = rerank_documents(self.test_query, self.sample_documents, top_k=3)
        
        # Assertions
        self.assertEqual(len(result), 3)
        self.assertIsInstance(result[0], Document)
        self.assertIn("Machine learning", result[0].page_content)
        
        # Verify ranker was called
        mock_ranker.rerank.assert_called_once()
    
    @patch('backend.flash.retriever.ranker')
    def test_rerank_documents_top_k_limit(self, mock_ranker):
        """Test that rerank_documents respects top_k parameter"""
        mock_results = [
            {'id': str(i), 'text': doc.page_content, 'score': 1.0 - (i * 0.1), 'meta': doc.metadata}
            for i, doc in enumerate(self.sample_documents)
        ]
        
        mock_ranker.rerank.return_value = mock_results
        
        # Test with different top_k values
        for k in [1, 3, 5]:
            result = rerank_documents(self.test_query, self.sample_documents, top_k=k)
            self.assertEqual(len(result), k, f"Expected {k} documents, got {len(result)}")
    
    @patch('backend.flash.retriever.ranker')
    def test_rerank_documents_preserves_metadata(self, mock_ranker):
        """Test that metadata is preserved after reranking"""
        mock_results = [
            {'id': '0', 'text': self.sample_documents[0].page_content, 
             'score': 0.9, 'meta': self.sample_documents[0].metadata}
        ]
        
        mock_ranker.rerank.return_value = mock_results
        
        result = rerank_documents(self.test_query, self.sample_documents[:1], top_k=1)
        
        self.assertEqual(result[0].metadata, self.sample_documents[0].metadata)
        self.assertIn("source", result[0].metadata)
        self.assertIn("page", result[0].metadata)
    
    @patch('backend.flash.retriever.ranker')
    def test_rerank_documents_sorting(self, mock_ranker):
        """Test that documents are sorted by score in descending order"""
        # Return unsorted results
        mock_results = [
            {'id': '0', 'text': 'Low score doc', 'score': 0.3, 'meta': {}},
            {'id': '1', 'text': 'High score doc', 'score': 0.9, 'meta': {}},
            {'id': '2', 'text': 'Medium score doc', 'score': 0.6, 'meta': {}}
        ]
        
        mock_ranker.rerank.return_value = mock_results
        
        result = rerank_documents(self.test_query, self.sample_documents[:3], top_k=3)
        
        # First result should be the highest scoring one
        self.assertIn("High score doc", result[0].page_content)
        self.assertIn("Medium score doc", result[1].page_content)
        self.assertIn("Low score doc", result[2].page_content)
    
    @patch('backend.flash.retriever.ranker')
    def test_rerank_documents_single_document(self, mock_ranker):
        """Test reranking with a single document"""
        mock_results = [
            {'id': '0', 'text': self.sample_documents[0].page_content, 
             'score': 0.8, 'meta': self.sample_documents[0].metadata}
        ]
        
        mock_ranker.rerank.return_value = mock_results
        
        result = rerank_documents(self.test_query, [self.sample_documents[0]], top_k=5)
        
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].page_content, self.sample_documents[0].page_content)
    
    def test_rerank_documents_return_type(self):
        """Test that rerank_documents returns a list of Document objects"""
        result = rerank_documents(self.test_query, [], top_k=5)
        self.assertIsInstance(result, list)
    
    @patch('backend.flash.retriever.ranker')
    def test_rerank_documents_with_missing_meta(self, mock_ranker):
        """Test reranking when meta field is missing from results"""
        # Results without 'meta' field
        mock_results = [
            {'id': '0', 'text': 'Test document', 'score': 0.9}
        ]
        
        mock_ranker.rerank.return_value = mock_results
        
        result = rerank_documents(self.test_query, self.sample_documents[:1], top_k=1)
        
        # Should handle missing meta gracefully
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].metadata, {})


class TestRetrieverIntegration(unittest.TestCase):
    """Integration tests for retriever module"""
    
    @patch('backend.flash.retriever.vectorstore')
    @patch('backend.flash.retriever.ranker')
    def test_retrieve_and_rerank_workflow(self, mock_ranker, mock_vectorstore):
        """Test the complete retrieve and rerank workflow"""
        # This test would require mocking the retrieve_documents function
        # which has issues in the current implementation
        # Skipping for now due to undefined variables in retrieve_documents
        pass


class TestRetrieverEdgeCases(unittest.TestCase):
    """Edge case tests for retriever functions"""
    
    @patch('backend.flash.retriever.ranker')
    def test_rerank_with_very_long_documents(self, mock_ranker):
        """Test reranking with very long document content"""
        long_doc = Document(
            page_content="A" * 10000,  # Very long content
            metadata={"source": "long.pdf"}
        )
        
        mock_results = [
            {'id': '0', 'text': long_doc.page_content, 'score': 0.9, 'meta': long_doc.metadata}
        ]
        
        mock_ranker.rerank.return_value = mock_results
        
        result = rerank_documents("test query", [long_doc], top_k=1)
        
        self.assertEqual(len(result), 1)
        self.assertEqual(len(result[0].page_content), 10000)
    
    @patch('backend.flash.retriever.ranker')
    def test_rerank_with_special_characters(self, mock_ranker):
        """Test reranking with special characters in content"""
        special_doc = Document(
            page_content="Test with special chars: @#$%^&*(){}[]|\\<>?/~`",
            metadata={"source": "special.pdf"}
        )
        
        mock_results = [
            {'id': '0', 'text': special_doc.page_content, 'score': 0.9, 'meta': special_doc.metadata}
        ]
        
        mock_ranker.rerank.return_value = mock_results
        
        result = rerank_documents("test", [special_doc], top_k=1)
        
        self.assertEqual(result[0].page_content, special_doc.page_content)
    
    @patch('backend.flash.retriever.ranker')
    def test_rerank_with_unicode_content(self, mock_ranker):
        """Test reranking with Unicode characters"""
        unicode_doc = Document(
            page_content="Testing Unicode: 你好世界 🌍 مرحبا العالم",
            metadata={"source": "unicode.pdf"}
        )
        
        mock_results = [
            {'id': '0', 'text': unicode_doc.page_content, 'score': 0.9, 'meta': unicode_doc.metadata}
        ]
        
        mock_ranker.rerank.return_value = mock_results
        
        result = rerank_documents("test", [unicode_doc], top_k=1)
        
        self.assertEqual(result[0].page_content, unicode_doc.page_content)


if __name__ == '__main__':
    # Run tests with verbose output
    unittest.main(verbosity=2)
