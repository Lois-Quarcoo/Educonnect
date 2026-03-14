// Helper function to load sample PDFs for testing
export const getSamplePDFs = () => {
  return [
    {
      name: 'Sample Educational Content',
      filename: 'sample.pdf',
      description: 'A comprehensive sample PDF about programming and software development',
      size: '2.5 KB',
      subject: 'Computer Science'
    }
  ];
};

// Function to get the local path to a sample PDF
export const getSamplePDFPath = (filename) => {
  return `assets/pdfs/${filename}`;
};
