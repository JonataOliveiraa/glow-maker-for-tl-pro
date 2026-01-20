import React from 'react';

const DownloadButton = ({ canvasRef }) => {
  const handleDownload = () => {
    if (!canvasRef.current) return;

    try {
      // 1. Pega os dados da imagem do canvas em formato Base64
      // É importante que o canvas tenha sido criado com 'preserveDrawingBuffer: true'
      const dataURL = canvasRef.current.toDataURL('image/png');

      // 2. Cria um link temporário para forçar o download
      const link = document.createElement('a');
      link.href = dataURL;
      // Gera um nome de arquivo com timestamp
      link.download = `glow-effect-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Erro ao baixar o glow:", err);
      alert("Não foi possível gerar a imagem. Tente novamente.");
    }
  };

  return (
    <button
      onClick={handleDownload}
      style={{
        width: '100%',
        padding: '12px',
        background: 'linear-gradient(45deg, #ff00ff, #00ffff)',
        border: 'none',
        borderRadius: '4px',
        color: 'white',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '20px',
        fontSize: '14px',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}
    >
      Baixar PNG 💾
    </button>
  );
};

export default DownloadButton;