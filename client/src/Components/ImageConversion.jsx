import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import '../Styles/ImageConverter.css';

const ImageConverter = () => {
  const [images, setImages] = useState([]);
  const [format, setFormat] = useState('jpeg');
  const [successMessage, setSuccessMessage] = useState('');

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("Please select at least one image.");
      return;
    }

    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IPCONFIG}convert?format=${format}`,
        formData,
        {
          responseType: 'blob',
        }
      );

      // Log response to debug
      console.log("Response received:", response);

      const currentDateTime = new Date().toISOString().replace(/:/g, '-');
      const zipFileName = `${currentDateTime}.zip`;

      // Create a download link for the zip file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', zipFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();


      setSuccessMessage('Images successfully converted and downloaded!');
      setImages([]);
      e.target.reset();


      setTimeout(() => setSuccessMessage(''), 60000);

    } catch (error) {
      console.error('Error converting images:', error);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center image-converter-container">

      <div className="converter-box">

        <h2 className="text-center mb-4">Image Converter</h2>

        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formFile">
            <Form.Label>Choose images</Form.Label>
            <Form.Control type="file" accept="image/*" multiple onChange={handleImageChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Select format</Form.Label>
            <Form.Select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
            </Form.Select>
          </Form.Group>

          <Button className="buttonNew1 d-block mx-auto" type="submit">
            Convert Images
          </Button>

          <div>
            <h3 style={{marginTop:'5px'}}>Note:</h3>
            <ul className='note'>
              <li>Before uploading images for story creation, ensure all images are converted here.</li>
              <li>This page is primarily used to convert images downloaded from social media platforms such as WhatsApp, Facebook, Twitter, etc.</li>
              <li>Converted images will be sent to the designers' systems without any issues.</li>
            </ul>
          </div>

        </Form>
      </div>
    </Container>
  );
};

export default ImageConverter;
