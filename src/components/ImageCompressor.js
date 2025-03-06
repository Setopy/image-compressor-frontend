import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';

// API URL from your Render deployment
const API_URL = 'https://image-compressor-api-t7rz.onrender.com';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const DropArea = styled.div`
  border: 2px dashed #cccccc;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 20px;
  background-color: ${props => props.isDragActive ? '#f0f8ff' : 
'#f9f9f9'};
`;

const ControlsContainer = styled.div`
  margin-bottom: 20px;
`;

const Button = styled.button`
  background-color: #4285f4;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  &:disabled {
    background-color: #cccccc;
  }
`;

const ImagePreview = styled.div`
  margin-top: 20px;
  img {
    max-width: 100%;
    max-height: 300px;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
`;

const ImageCompressor = () => {
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState(85);
  const [maxSize, setMaxSize] = useState(3840);
  const [processing, setProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': []
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      setFiles(acceptedFiles);
      setPreviewUrl(URL.createObjectURL(acceptedFiles[0]));
      setError(null);
    }
  });

  const handleCompression = async () => {
    if (!files.length) return;
    
    setProcessing(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('quality', quality);
    formData.append('maxSize', maxSize);
    
    try {
      const response = await axios.post(`${API_URL}/compress`, formData, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `compressed_${files[0].name}`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error compressing image:', err);
      setError('Error compressing image. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Container>
      <h1>Image Compressor</h1>
      
      <DropArea {...getRootProps()} isDragActive={isDragActive}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the image here...</p>
        ) : (
          <p>Drag and drop an image here, or click to select a file</p>
        )}
      </DropArea>
      
      <ControlsContainer>
        <div>
          <label htmlFor="quality">Quality (1-100): {quality}</label>
          <input
            type="range"
            id="quality"
            min="1"
            max="100"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div>
          <label htmlFor="maxSize">Max Dimension (pixels): 
{maxSize}</label>
          <input
            type="range"
            id="maxSize"
            min="100"
            max="8000"
            step="100"
            value={maxSize}
            onChange={(e) => setMaxSize(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </ControlsContainer>
      
      {previewUrl && (
        <ImagePreview>
          <h3>Preview</h3>
          <img src={previewUrl} alt="Preview" />
        </ImagePreview>
      )}
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <Button 
        onClick={handleCompression} 
        disabled={!files.length || processing}
      >
        {processing ? 'Processing...' : 'Compress Image'}
      </Button>
    </Container>
  );
};

export default ImageCompressor;
