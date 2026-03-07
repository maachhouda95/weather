function getWeatherIcon(code) {
  if (code === 0) return "fa-sun";
  if ([1, 2, 3].includes(code)) return "fa-cloud-sun";
  if ([45, 48].includes(code)) return "fa-smog";
  if ([51, 53, 55, 56, 57].includes(code)) return "fa-cloud-rain";
  if ([61, 63, 65, 66, 67].includes(code)) return "fa-cloud-showers-heavy";
  if ([71, 73, 75, 77].includes(code)) return "fa-snowflake";
  if ([80, 81, 82].includes(code)) return "fa-cloud-showers-heavy";
  if ([95, 96, 99].includes(code)) return "fa-bolt";
  return "fa-sun";
}

function getWeatherColor(code) {
  if (code === 0) return "#FFD43B"; 
  if ([1, 2, 3].includes(code)) return "#FFE799"; 
  if ([45, 48].includes(code)) return "#B0B0B0"; 
  if ([51, 53, 55, 56, 57].includes(code)) return "#3FA7D6"; 
  if ([61, 63, 65, 66, 67].includes(code)) return "#3FA7D6"; 
  if ([71, 73, 75, 77].includes(code)) return "#E0F0FF"; 
  if ([80, 81, 82].includes(code)) return "#3FA7D6";
  if ([95, 96, 99].includes(code)) return "#F7FF00"; 
  return "#FFD43B";
}

function getWeather() {
  const city = document.getElementById("cityInput").value;
  if (!city) return alert("Enter a city");

  fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`)
    .then((res) => res.json())
    .then((geo) => {
      if (!geo.results) return alert("City not found");

      const place = geo.results[0];
      const lat = place.latitude;
      const lon = place.longitude;

      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (
            !data.hourly ||
            !data.hourly.time ||
            !data.hourly.temperature_2m
          ) {
            console.error("Hourly data missing", data);
            return;
          }
          if (
            !data.daily ||
            !data.daily.time ||
            !data.daily.temperature_2m_max
          ) {
            console.error("Daily data missing", data);
            return;
          }

          document.getElementById("city").innerText =
            place.name + ", " + place.country;
          document.getElementById("temp").innerText =
            Math.round(data.current_weather.temperature) + "°";
          document.getElementById("wind").innerText =
            `Wind: ${data.current_weather.windspeed} km/h`;
          document.getElementById("highlow").innerText =
            `H:${Math.round(data.daily.temperature_2m_max[0])}° L:${Math.round(data.daily.temperature_2m_min[0])}°`;

          const hourlyDiv = document.getElementById("hourly");
          hourlyDiv.innerHTML = "";

          const currentTime = new Date(data.current_weather.time).getTime();
          let currentHourIndex = 0;
          for (let i = 0; i < data.hourly.time.length; i++) {
            const t = new Date(data.hourly.time[i]).getTime();
            if (t >= currentTime) {
              currentHourIndex = i;
              break;
            }
          }

          for (let i = currentHourIndex; i < currentHourIndex + 24; i++) {
            const hour = data.hourly.time[i].split("T")[1].slice(0, 5);
            const temp = Math.round(data.hourly.temperature_2m[i]);
            const iconClass = getWeatherIcon(data.hourly.weathercode[i] || 0);
            const iconColor = getWeatherColor(data.hourly.weathercode[i] || 0);

            hourlyDiv.innerHTML += `
                            <div class="hour-box">
                                <p>${hour}</p>
                                <i class="fa-solid ${iconClass}" style="color:${iconColor};"></i>
                                <p>${temp}°</p>
                            </div>
                        `;
          }

          const dailyDiv = document.getElementById("daily");
          dailyDiv.innerHTML = "";

          for (let i = 0; i < 7; i++) {
            const day = new Date(data.daily.time[i]).toLocaleDateString(
              "en-US",
              { weekday: "short" },
            );
            const iconClass = getWeatherIcon(data.daily.weathercode[i] || 0);
            const iconColor = getWeatherColor(data.daily.weathercode[i] || 0);

            dailyDiv.innerHTML += `
                            <div class="day-row">
                                <span>${day} <i class="fa-solid ${iconClass}" style="color:${iconColor};"></i></span>
                                <span>${Math.round(data.daily.temperature_2m_max[i])}° / ${Math.round(data.daily.temperature_2m_min[i])}°</span>
                            </div>
                        `;
          }
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
}