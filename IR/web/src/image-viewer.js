const canvas = document.getElementById("imgView");
const ctx = canvas.getContext("2d");
let img = new Image();

let imgData = null;

async function createCanvas(fileContent) {
  return new Promise((resolve, reject) => {
    img = new Image();
    const blob = new Blob([fileContent], { type: 'image/bmp' });
    img.src = URL.createObjectURL(blob);
    
    canvas.width = img.width;
    canvas.height = img.height;

    img.onload = function(e) {
      try {
        canvas.width = img.width;
        canvas.height = img.height;

        console.log('1OriginalPicSize:', img.naturalWidth,'x',img.naturalHeight,' Pixel');
        console.log('1ScreenPicSize:', img.clientWidth,'x',img.clientHeight,' Pixel');
        console.log('1CanvasPicSize:', canvas.width,'x',canvas.height,' Pixel');

        ctx.drawImage(img, 0, 0);
        imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        resolve(img);
      } catch (error) {
        console.error(error)
        Toast.show(t.errorLoadFile, "error");
        reject(error);
      }
    };

    img.onerror = reject;
  });
}

/*
img.addEventListener('load', function() {
  console.log('3OriginalPicSize:', img.naturalWidth,'x',img.naturalHeight,' Pixel');
  console.log('3ScreenPicSize:', img.clientWidth,'x',img.clientHeight,' Pixel');
});*/

function getPixel(x, y) {
  const i = (y * canvas.width + x) * 4;

  return {
      r: imgData.data[i],
      g: imgData.data[i + 1],
      b: imgData.data[i + 2],
      a: imgData.data[i + 3]
  };
}