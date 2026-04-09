function getMeasurandFromMode(mode) {
  const t = translations[currentLang];

  switch (mode) {
    case "AC/V":
    case "DC/V":
      return t.voltage;
    case "AC/A":
    case "DC/A":
      return t.current;
    case "Hz":
      return t.frequence;
    case "C":
      return t.capacity;
    case "°C":
    case "°F":
      return t.temperature;
    case "Ω":
      return t.resistance;
  }
}

async function readFileByLines(file) {
  const decoder = new TextDecoder();
  const reader = file.stream().getReader();

  let { value, done } = await reader.read();
  let chunk = "";
  
  while (!done) {
    chunk += decoder.decode(value, { stream: true });

    const lines = chunk.split(/\r?\n/);
    chunk = lines.pop(); // unvollständige Zeile behalten

    ({ value, done } = await reader.read());
  }
}

async function readFileAndTransformData(file) {
  return new Promise((resolve, reject) => {
    const t = translations[currentLang];
    
    if (file !== null && file.name.toLowerCase().endsWith(".vom")) {
      //Toast.show(t.loading, "info");

      //< 10 MB	readAsText + split
      //> 50 MB	stream() Methode
      //const file = e.target.files[0];
      //readFileByLines(file);
      
      const reader = new FileReader();
      reader.onload = function(e) {
        const fileContent = e.target.result;
        const lines = fileContent.split(/\r?\n/);
        const parameters = new Map();
        const data = [];

        //Parse file
        lines.forEach((line, index) => {
          //console.log(`Zeile ${index + 1}: ${line}`);
          const obj = line.split(':');
          if (obj.length == 2) {
            parameters.set(obj[0], obj[1]);
          }
          else if (obj.length == 1 && index > 1) {
            data.push(obj)
          }
        });

        try {
          const ratioUnit = parameters.get("Ratio") ?? 1;
          const sampleIntervalNumber = parseFloat(parameters.get("Cycle").trimEnd('s'));

          //Data transformation
          if(data.length < 1) {
            throw new Error(t.errorNoMeasurementData);
          }
          const dataY = new Int16Array(data.length);
          for (let i = 0; i < data.length; i++) {
            dataY[i] = data[i] / ratioUnit;
          }
          const dataX = Array.from({length: dataY.length}, (_,i) => i * sampleIntervalNumber)
          
          Toast.show(t.loaded + " " + file.name, "success");
          resolve({
            data: [dataX, dataY],
            parameter: parameters
          });
        } catch (error) {
          console.error(error)
          Toast.show(t.errorLoadFile, "error");
          reject(error);
        }
      };

      reader.onerror = function() {
        console.error(reader.error)
        Toast.show(t.errorLoadFile, "error");
        reject(reader.error);
      };

      reader.readAsText(file);
    }
    else {
      console.error(t.errorWrongFile)
      Toast.show(t.errorWrongFile, "error");
      reject(t.errorWrongFile);
    }
  });
}