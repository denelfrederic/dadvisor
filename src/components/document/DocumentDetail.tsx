
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DocumentDetailDialog from './DocumentDetailDialog';

const DocumentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/adminllm');
  };

  return (
    <DocumentDetailDialog
      documentId={id || null}
      isOpen={true}
      onClose={handleClose}
    />
  );
};

export default DocumentDetail;
