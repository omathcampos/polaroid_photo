const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const downloadBtn = document.getElementById("download");
const colorPicker = document.getElementById("polaroidColor");
const textInput = document.getElementById("polaroidText");
const filterBtns = document.querySelectorAll(".filter-btn");
const formatSelect = document.getElementById("polaroidFormat");

let currentImg = null;
let currentText = "";
let currentFilter = "none";
let currentFormat = "classic";

const FORMATS = {
  classic: {
    width: 360,
    height: 440,
    borderTop: 20,
    borderSides: 20,
    borderBottom: 100,
    photoW: 320,
    photoH: 320,
  },
  landscape: {
    width: 440,
    height: 340,
    borderTop: 16,
    borderSides: 20,
    borderBottom: 60,
    photoW: 400,
    photoH: 200,
  },
  portrait: {
    width: 300,
    height: 500,
    borderTop: 24,
    borderSides: 20,
    borderBottom: 100,
    photoW: 260,
    photoH: 340,
  },
  mini: {
    width: 220,
    height: 280,
    borderTop: 12,
    borderSides: 12,
    borderBottom: 40,
    photoW: 180,
    photoH: 140,
  },
  large: {
    width: 520,
    height: 600,
    borderTop: 32,
    borderSides: 20,
    borderBottom: 120,
    photoW: 480,
    photoH: 400,
  },
};

function getCanvasFilter(filter) {
  switch (filter) {
    case "grayscale":
      return "grayscale(1)";
    case "sepia":
      return "sepia(1)";
    case "brightness":
      return "brightness(1.25)";
    case "contrast":
      return "contrast(1.3)";
    default:
      return "none";
  }
}

function drawPolaroid(img, borderColor, text, filter, formatKey) {
  const fmt = FORMATS[formatKey] || FORMATS.classic;
  const polaroidWidth = fmt.width;
  const polaroidHeight = fmt.height;
  const borderTop = fmt.borderTop;
  const borderSides = fmt.borderSides;
  const borderBottom = fmt.borderBottom;
  const photoWidth = fmt.photoW;
  const photoHeight = fmt.photoH;

  // Ajustar o tamanho do canvas
  canvas.width = polaroidWidth;
  canvas.height = polaroidHeight;

  // Limpar canvas
  ctx.clearRect(0, 0, polaroidWidth, polaroidHeight);
  // Fundo colorido (borda polaroid)
  ctx.fillStyle = borderColor;
  ctx.fillRect(0, 0, polaroidWidth, polaroidHeight);

  // Calcular área de crop da imagem original para caber na área da foto
  let sx = 0,
    sy = 0,
    sWidth = img.width,
    sHeight = img.height;
  const imgRatio = img.width / img.height;
  const photoRatio = photoWidth / photoHeight;
  if (imgRatio > photoRatio) {
    // Imagem mais "larga" que a área: crop nas laterais
    sHeight = img.height;
    sWidth = img.height * photoRatio;
    sx = (img.width - sWidth) / 2;
  } else {
    // Imagem mais "alta" que a área: crop em cima/baixo
    sWidth = img.width;
    sHeight = img.width / photoRatio;
    sy = (img.height - sHeight) / 2;
  }
  // Aplicar filtro
  ctx.save();
  ctx.filter = getCanvasFilter(filter);
  // Desenhar imagem centralizada e cortada
  ctx.drawImage(
    img,
    sx,
    sy,
    sWidth,
    sHeight, // fonte (crop)
    borderSides,
    borderTop,
    photoWidth,
    photoHeight // destino (canvas)
  );
  ctx.restore();

  // Desenhar texto na borda inferior
  if (text && text.trim() !== "") {
    ctx.save();
    ctx.font =
      "bold 1.15rem 'Comic Sans MS', 'Comic Sans', 'Inter', Arial, sans-serif";
    ctx.fillStyle = "#222";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 2;
    ctx.fillText(
      text,
      polaroidWidth / 2,
      polaroidHeight - borderBottom / 2 + 8
    );
    ctx.restore();
  }

  canvas.style.display = "block";
  downloadBtn.disabled = false;
}

upload.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = function () {
    currentImg = img;
    drawPolaroid(
      img,
      colorPicker.value,
      textInput.value,
      currentFilter,
      currentFormat
    );
  };
  img.src = URL.createObjectURL(file);
});

colorPicker.addEventListener("input", function () {
  if (currentImg) {
    drawPolaroid(
      currentImg,
      colorPicker.value,
      textInput.value,
      currentFilter,
      currentFormat
    );
  }
});

textInput.addEventListener("input", function () {
  if (currentImg) {
    drawPolaroid(
      currentImg,
      colorPicker.value,
      textInput.value,
      currentFilter,
      currentFormat
    );
  }
});

filterBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.getAttribute("data-filter");
    if (currentImg) {
      drawPolaroid(
        currentImg,
        colorPicker.value,
        textInput.value,
        currentFilter,
        currentFormat
      );
    }
  });
});
filterBtns[0].classList.add("active");

formatSelect.addEventListener("change", function () {
  currentFormat = formatSelect.value;
  if (currentImg) {
    drawPolaroid(
      currentImg,
      colorPicker.value,
      textInput.value,
      currentFilter,
      currentFormat
    );
  }
});

downloadBtn.addEventListener("click", function () {
  const link = document.createElement("a");
  link.download = "polaroid.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});
