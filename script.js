function toBionicText(text) {
  if (!text) return '';
  const lines = text.split('\n');
  return lines.map(line => {
    const words = line.split(/(\s+)/);
    return words.map(word => {
      if (word.length < 3 || /\s/.test(word)) {
        return word;
      }
      const boldLength = Math.min(2, Math.ceil(word.length / 2));
      return `<strong>${word.slice(0, boldLength)}</strong>${word.slice(boldLength)}`;
    }).join('');
  }).join('<br>');
}

function alignText(alignment) {
  const editor = document.getElementById('editor');
  const output = document.getElementById('output');

  if (editor && output) {
    editor.style.textAlign = alignment.toLowerCase();
    output.style.textAlign = alignment.toLowerCase();
  }
}

let currentToast = null;
function showToast(message, color, duration = 3000) {
  if (currentToast) {
    currentToast.remove();
    currentToast = null;
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.backgroundColor = color || '#333';

  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  container.appendChild(toast);
  currentToast = toast;

  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
        currentToast = null;
      }, 300);
    }
  }, duration);
}

document.addEventListener('DOMContentLoaded', function () {
  const titulo = document.getElementById('titulo');
  if (titulo) {
    titulo.innerHTML = toBionicText(titulo.textContent);
  }

  document.querySelectorAll('.subtitle').forEach(el => {
    el.innerHTML = toBionicText(el.textContent);
  });

  const version = document.getElementsByClassName('version');
  if (version) {
    version.innerHTML = toBionicText(version.textContent);
  }

  // Funcionalidad del área de texto
  const inputArea = document.getElementById('editor');
  const output = document.getElementById('output');

  if (inputArea && output) {
    inputArea.addEventListener('input', function (event) {
      const inputText = event.target.innerText;
      const outputText = toBionicText(inputText);
      output.innerHTML = outputText;
    });

    // Botón Limpiar
    document.getElementById('clearBtn')?.addEventListener('click', () => {
      inputArea.innerHTML = '';
      output.innerHTML = '';
    });
  }

  const exportBtn = document.getElementById('exportPdfBtn');
if (exportBtn) {
  exportBtn.addEventListener('click', async () => {
    const editor = document.getElementById('editor');
    if (!editor || editor.innerText.trim() === '') {
      showToast('El área de texto está vacía. No hay contenido para exportar.', '#e74c3c');
      return;
    }

    const outputDiv = document.getElementById('output');
    const originalHTML = outputDiv.innerHTML;
    const titleEl = document.createElement('div');

    if (!outputDiv) return;

    // Guardar el color original
    const originalColor = outputDiv.style.color || getComputedStyle(outputDiv).color;
    
    // Cambiar temporalmente a negro
    outputDiv.style.color = '#000';
    // También aplica a los <strong> dentro
    const strongs = outputDiv.querySelectorAll('strong');
    strongs.forEach(strong => {
      strong.style.color = '#000';
    });

    titleEl.innerHTML = '<h2 style="margin: 0 0 16px 0; font-family: sans-serif; color: #333;">Lectura Biónica</h2>';
    outputDiv.insertBefore(titleEl, outputDiv.firstChild);

    try {
      const canvas = await html2canvas(outputDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, 297));
      pdf.save("lectura-bionica.pdf");
    } catch (error) {
      console.error("Error al generar PDF:", error);
      showToast("❌ Error al generar el PDF", "#e74c3c");
    } finally {
      outputDiv.innerHTML = originalHTML;
      outputDiv.style.color = originalColor;
      strongs.forEach(strong => {
        strong.style.color = '';
      });
    }
  });
}

  document.getElementById('alignRightBtn')?.addEventListener('click', () => alignText('Right'));
  document.getElementById('alignCenterBtn')?.addEventListener('click', () => alignText('Center'));
  document.getElementById('alignLeftBtn')?.addEventListener('click', () => alignText('Left'));
});