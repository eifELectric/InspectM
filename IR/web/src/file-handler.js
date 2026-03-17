const CelsiusToFahrenheitFactor = 1.8;
const FahrenheitOffset = 32;
const KelvinOffset = 273.15;
const Celsius = 1;
const Fahrenheit = 2;
const Kelvin = 3;

/*
	const unitOffset = 33;
	const maxTempOffset = 35;
	const minTempOffset = 39;
	const tempCompensationOffset = 47;
	const temperatureMatrixOffset = 59;

	const matrixSizeX = 256;
	const matrixSizeY = 192;

	const ratio = 10.0;

  Sensorformate nutzen Offset -> keine negativen Zahlen (0°C = 3200, 50°C = 6400, ...))
	const SensorOffset = 3200;
  Temperatur 1/64°C Auflösung
	const SensorScale = 64;
*/

let ir_data_v100 = null;
let ir_colors = [];
let ir_parameters = new Map();

//ir_colors.push({ r: 255, g: 0, b: 0 });

function celsiusToFahrenheit(celsius) {
}
function celsiusToKelvin(temperature) {
}
function celsiusTo(temperature, unit) {
  switch (unit)
  {
    case Celsius:
      break;
    case Fahrenheit:
      temperature = (temperature * CelsiusToFahrenheitFactor) - FahrenheitOffset;
      break;
    case Kelvin:
      temperature = temperature + KelvinOffset;
      break;
    default:
      break;
  }

  return temperature;
}

function getTemperatureUnitSymbol(unit) {
  let symbol = "";

  switch (unit)
  {
    case Kelvin:
      symbol = "K";
      break;
    case Fahrenheit:
      symbol = "°F";
      break;
    case Celsius:
    default:
      symbol = "°C";
      break;
  }

  return symbol;
}

/*
bilineare Interpolation zum vergrößeren eines 2D-Arrays.

Für jeden neuen Pixel (srcX, srcY) Wert aus 4 Nachbarpixeln berechnet:
v00 ---- v10
 |        |
 |   P    |
 |        |
v01 ---- v11

Interpolation: P = gewichtete Mischung der 4 Werte
*/
function interpolation(src, src_w, src_h, resizeFactor) {
  const newH = Math.floor(src_h * resizeFactor);
  const newW = Math.floor(src_w * resizeFactor);

  let dst = Array.from({ length: newH }, () => new Array(newW).fill(0));

  for (let y = 0; y < newH; y++) {
    for (let x = 0; x < newW; x++) {
      const srcX = x / resizeFactor;
      const srcY = y / resizeFactor;

      const x0 = Math.floor(srcX);
      const x1 = Math.min(x0 + 1, src_w - 1);

      const y0 = Math.floor(srcY);
      const y1 = Math.min(y0 + 1, src_h - 1);

      const dx = srcX - x0;
      const dy = srcY - y0;

      const v00 = src[y0][x0];
      const v10 = src[y0][x1];
      const v01 = src[y1][x0];
      const v11 = src[y1][x1];

      dst[y][x] =
          v00 * (1 - dx) * (1 - dy) +
          v10 * dx * (1 - dy) +
          v01 * (1 - dx) * dy +
          v11 * dx * dy;
    }
  }

  return dst;
}

function readBitMapTempV201(arrayBuffer, fileSize) {
  const view = new DataView(arrayBuffer);
  ir_data_v100 = Array.from({ length: 240}, () =>
                              Array(240).fill(0)
                            );
  let ir_data_v100_temp = Array.from({ length: 48}, () =>
                                        Array(48).fill(0)
                                      );
  
  const temperatureMatrixOffset = fileSize + 60;

  const unit = 1;
  let ir_max_temp = (view.getUint16(temperatureMatrixOffset) - 3200) / 64 + ir_temp_compensation;
  let ir_min_temp = (view.getUint16(temperatureMatrixOffset) - 3200) / 64 + ir_temp_compensation;
  const ir_temp_compensation = view.getInt16(fileSize + 48, true) / 100;
  
  for (let i = 0; i < ir_data_v100_temp.length; i++)
  {
    for (let j = 0; j < ir_data_v100_temp[i].length; j++)
    {
      const curElement = i * ir_data_v100_temp[i].length * 2 + j * 2;
      let temperature = (view.getUint16(temperatureMatrixOffset + curElement, true) - 3200) / 64 + ir_temp_compensation;
      
      if (ir_max_temp < temperature)
      {
        ir_max_temp = temperature;
      }
      if (ir_min_temp > temperature)
      {
        ir_min_temp = temperature;
      }
      
      //console.log("i:", i, "j:", j, "temp", temperature);
      ir_data_v100_temp[i][j] = temperature;
    }
  }

  ir_data_v100 = interpolation(ir_data_v100_temp, 48, 48, 5);
	
  ir_parameters.set("lowestTemperature", ir_min_temp);
  ir_parameters.set("highestTemperature", ir_max_temp);
}

function readBitMapTempV201_FR05B_FR06B(arrayBuffer, fileSize) {
  const view = new DataView(arrayBuffer);
  ir_data_v100 = Array.from({ length: 160}, () =>
                              Array(160).fill(0)
                            );
  let ir_data_v100_temp = Array.from({ length: 32}, () =>
                                        Array(32).fill(0)
                                      );
  
  const temperatureMatrixOffset = fileSize + 60;

  const unit = view.getUint8(fileSize + 33);
  let ir_max_temp = view.getUint16(fileSize + 36, true) / 10;
  let ir_min_temp = view.getUint16(fileSize + 40, true) / 10;
  const ir_temp_compensation = view.getInt16(fileSize + 48, true) / 100;
  
  for (let i = 0; i < ir_data_v100_temp.length; i++)
  {
    for (let j = 0; j < ir_data_v100_temp[i].length; j++)
    {
      const curElement = i * ir_data_v100_temp[i].length * 2 + j * 2;
      let temperature = view.getUint16(temperatureMatrixOffset + curElement, true) / 10.0 + ir_temp_compensation;
      switch (unit)
      {
        case Celsius:
          break;
        case Fahrenheit:
          temperature = (temperature - FahrenheitOffset) / CelsiusToFahrenheitFactor;
          break;
        case Kelvin:
          temperature = temperature - KelvinOffset;
          break;
        default:
          break;
      }
/* nicht erforderlich
      if (ir_max_temp < temperature)
      {
        ir_max_temp = temperature;
      }
      if (ir_min_temp > temperature)
      {
        ir_min_temp = temperature;
      }*/
      
      //console.log("i:", i, "j:", j, "temp", temperature);
      ir_data_v100_temp[i][j] = temperature;
    }
  }
  ir_data_v100 = interpolation(ir_data_v100_temp, 32, 32, 5);

  ir_parameters.set("lowestTemperature", ir_min_temp);
  ir_parameters.set("highestTemperature", ir_max_temp);
}

function readBitMapTempV200(arrayBuffer, fileSize) {
  const view = new DataView(arrayBuffer);
  ir_data_v100 = Array.from({ length: 256}, () =>
                              Array(192).fill(0)
                            );
  
  const temperatureMatrixOffset = fileSize + 60;

  const unit = view.getUint8(fileSize + 33);
  let ir_max_temp = view.getUint16(fileSize + 36, true) / 10;
  let ir_min_temp = view.getUint16(fileSize + 40, true) / 10;
  const ir_temp_compensation = view.getInt16(fileSize + 48, true) / 100;
  
  for (let i = 0; i < ir_data_v100.length; i++)
  {
    for (let j = 0; j < ir_data_v100[i].length; j++)
    {
      const curElement = i * ir_data_v100[i].length * 2 + j * 2;
      let temperature = (view.getUint16(temperatureMatrixOffset + curElement, true) - 3200) / 64 + ir_temp_compensation;
      
      if (ir_max_temp < temperature)
      {
        ir_max_temp = temperature;
      }
      if (ir_min_temp > temperature)
      {
        ir_min_temp = temperature;
      }
      
      //console.log("i:", i, "j:", j, "temp", temperature);
      ir_data_v100[i][j] = temperature;
    }
  }

  ir_parameters.set("lowestTemperature", ir_min_temp);
  ir_parameters.set("highestTemperature", ir_max_temp);
}

function readBitMapTemp(arrayBuffer, fileSize) {
  const view = new DataView(arrayBuffer);
  ir_data_v100 = Array.from({ length: 256}, () =>
                              Array(192).fill(0)
                            );
  
  const temperatureMatrixOffset = fileSize + 56;

  const unit = 1;
  let ir_max_temp = view.getUint16(fileSize + 36, true) / 10;
  let ir_min_temp = view.getUint16(fileSize + 40, true) / 10;
  //const ir_temp_compensation = 0;
  
  for (let i = 0; i < ir_data_v100.length; i++)
  {
    for (let j = 0; j < ir_data_v100[i].length; j++)
    {
      const curElement = i * ir_data_v100[i].length * 2 + j * 2;
      let temperature = (view.getUint16(temperatureMatrixOffset + curElement, true) - 3200) / 64;
      
      if (ir_max_temp < temperature)
      {
        ir_max_temp = temperature;
      }
      if (ir_min_temp > temperature)
      {
        ir_min_temp = temperature;
      }
      
      //console.log("i:", i, "j:", j, "temp", temperature);
      ir_data_v100[i][j] = temperature;
    }
  }

  ir_parameters.set("lowestTemperature", ir_min_temp);
  ir_parameters.set("highestTemperature", ir_max_temp);
}

function readTemp(fileContent) {
  //>>> 0 wandelt in unsigned 32-bit Integer
  //const fileSize = (array[2] | (array[3] << 8) | (array[4] << 16) | (array[5] << 24)) >>> 0;
  const view = new DataView(fileContent);
  const fileSize = view.getUint32(2, true); // true = little-endian
  if (fileSize >= fileContent.byteLength)
  {
    Toast.show(t.errorNoTemperatureData, "error");
    reject(t.errorNoTemperatureData);
  }
  else
  {
    let deviceType = "";
    for (let i = 0; i < 15; i++) {
      const value = view.getUint8(fileSize + i);
      if (value !== 0) {
        deviceType += String.fromCharCode(view.getUint8(fileSize + i));
      }
    }
    
    //beispielsweise byte 307283+307282 (0x4B053+0x4B052 LE)
    const fileVersion = view.getUint16(fileSize + 16, true);
    switch(fileVersion) {
      case 100:
        readBitMapTemp(fileContent, fileSize);
        break;
      case 200:
        readBitMapTempV200(fileContent, fileSize);
        break;
      case 201:
        if (deviceType == "FR05B" || deviceType == "FR06B")
        {
          readBitMapTempV201_FR05B_FR06B(fileContent, fileSize);
        }
        else
        {
          readBitMapTempV201(fileContent, fileSize);
        }
        break;
      default:
        /*const fileVersion2 = view.getUint16(fileSize, true);
        if (fileVersion2 != 200)
        {
          readBitMapTemp_VColor();
        }
        else
        {
          readBitMapTemp_VColor_200(fileContent, fileSize);
        }*/
        Toast.show(t.errorWrongFileVersion, "error");
    }
    
    ir_parameters.set("deviceType", deviceType);
    ir_parameters.set("fileSize", fileSize);
    ir_parameters.set("fileVersion", fileVersion);
    ir_parameters.set("unit", Celsius);
  }
}

async function readFileAndTransformData(file) {
  return new Promise((resolve, reject) => {
    const t = translations[currentLang];
    
    if (file !== null && file.name.toLowerCase().endsWith('.bmp')) {
      const reader = new FileReader();
      reader.onload = async function(e) {
        const fileContent = e.target.result;

        await createCanvas(fileContent);
        readTemp(fileContent);

        Toast.show(t.loaded + " " + file.name, "success");
        resolve();
      };

      reader.onerror = function() {
        console.error(reader.error)
        Toast.show(t.errorLoadFile, "error");
        reject(reader.error);
      };

      reader.readAsArrayBuffer(file);
    }
    else {
      console.error(t.errorWrongFile)
      Toast.show(t.errorWrongFile, "error");
      image.src = '';
      reject(t.errorWrongFile);
    }
  });
}

function getTemperatureFromMap(corX, corY, picOffsetMinY, picOffsetMaxY, scaleFactorX, scaleFactorY) {
	if (corY >= picOffsetMinY && corY <= picOffsetMaxY)
	{
		const x = Math.trunc(corX / scaleFactorX);
		const y = Math.trunc((corY - picOffsetMinY) / scaleFactorY);
		const temperature = ir_data_v100[y][x];

		return temperature;
	}
	else
	{
    Toast.show(t.errorNotInImageArea, "error");
	}
}

function getTemperatureFromColor(corX, corY, picOffsetMinX, picOffsetMaxX, picOffsetMinY, picOffsetMaxY, scaleFactorX, scaleFactorY) {
	if (corX > picOffsetMinX && corX < picOffsetMaxX &&
		  corY > picOffsetMinY && corY < picOffsetMaxY)
	{
		const x = Math.trunc(corX / scaleFactorX);
		const y = Math.trunc(corY / scaleFactorY);
		const tcolor = getPixel(x, y);
    let index = ir_colors.findIndex(c => c.r === tcolor.r && c.g === tcolor.g && c.b === tcolor.b && c.a === tcolor.a);
    //index == colorTemperature??
		if (index > 0)
		{
			const temperature = (ir_max_temp - ir_min_temp) / 256 * index + ir_min_temp;
		  
      return temperature;
    }
		else
		{
		  Toast.show(ir_max_temp.ToString("≥00.00") + "℃ or " + ir_min_temp.ToString("≤00.00") + "℃", "error");
		}
	}
	else
	{
    Toast.show(t.errorNotInImageArea, "error");
	}
}

function getTemperature(corX, corY) {
  const deviceType = ir_parameters.get("deviceType");
  const fileVersion = ir_parameters.get("fileVersion");

  if (fileVersion == 12)
  {
    return getTemperatureFromColor(corX, corY, 0, 428, 0, 572, 2, 2);
  }
  else if (fileVersion == 200)
  {
    if (img.naturalWidth == 240 && img.naturalHeight == 320)
    {
      return getTemperatureFromMap(corX, corY, 65, 545, 2, 2);
    }
    else
    {
      //skalierung raus rechnen
      //480x640(571) zu (*1,5/*1,33333..) 320x480(427) zu (*1,66666...) 192x256
      return getTemperatureFromMap(corX, corY, 0, 571, 2.5, 2.22917);
    }
  }
  else if (fileVersion == 100)
  {
    return getTemperatureFromMap(corX, corY, 0, 571, 2.5, 2.22917);
  }
  else if (fileVersion == 201)
  {
    if (deviceType == "FR05B" || deviceType == "FR06B")
    {
      return getTemperatureFromMap(corX, corY, 65, 545, 3, 3);
    }
    else
    {
      return getTemperatureFromMap(corX, corY, 65, 545, 2, 2);
    }
  }
  else
  {
    return getTemperatureFromColor(corX, corY, 70, 444, 46, 548, 2, 2);
  }
}
