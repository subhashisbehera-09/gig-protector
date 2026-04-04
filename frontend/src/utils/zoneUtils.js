export const CITY_COORDS = {
  mumbai: { lat: 19.076, lng: 72.877 },
  delhi: { lat: 28.613, lng: 77.209 },
  bengaluru: { lat: 12.971, lng: 77.594 },
  chennai: { lat: 13.082, lng: 80.270 },
  kolkata: { lat: 22.572, lng: 88.363 },
  hyderabad: { lat: 17.385, lng: 78.486 },
  pune: { lat: 18.520, lng: 73.856 },
  ahmedabad: { lat: 23.022, lng: 72.571 },
  jaipur: { lat: 26.912, lng: 75.787 },
  lucknow: { lat: 26.846, lng: 80.946 },
  chandigarh: { lat: 30.733, lng: 76.779 },
  indore: { lat: 22.719, lng: 75.857 },
  bhopal: { lat: 23.259, lng: 77.412 },
  patna: { lat: 25.594, lng: 85.137 },
  nagpur: { lat: 21.145, lng: 79.081 },
  ludhiana: { lat: 30.900, lng: 75.851 },
  meerut: { lat: 28.984, lng: 77.706 },
  agra: { lat: 27.176, lng: 78.007 },
  vadodara: { lat: 22.307, lng: 73.181 },
  surat: { lat: 21.170, lng: 72.829 },
  kochi: { lat: 9.931, lng: 76.267 },
  visakhapatnam: { lat: 17.686, lng: 83.218 },
  bhubaneswar: { lat: 20.296, lng: 85.824 },
  cuttack: { lat: 20.462, lng: 85.879 },
  raipur: { lat: 21.251, lng: 81.629 },
  dehradun: { lat: 30.316, lng: 78.032 },
  jammu: { lat: 32.726, lng: 74.857 },
  srinagar: { lat: 34.083, lng: 74.797 },
  guwahati: { lat: 26.144, lng: 91.736 },
  coimbatore: { lat: 11.016, lng: 76.955 },
  mangalore: { lat: 12.914, lng: 74.855 },
  mysore: { lat: 12.295, lng: 76.638 },
};

export const ZONE_CIRCLES = {
  mumbai: [
    { name: 'Andheri', value: 'andheri_west', center: [19.135, 72.845], radius: 2500, baseFloodDays: 14 },
    { name: 'Kurla', value: 'kurla', center: [19.065, 72.885], radius: 2000, baseFloodDays: 12 },
    { name: 'Bandra', value: 'bandra', center: [19.055, 72.835], radius: 1800, baseFloodDays: 8 },
    { name: 'Dadar', value: 'dadar', center: [19.025, 72.850], radius: 2200, baseFloodDays: 9 },
    { name: 'Colaba', value: 'colaba', center: [18.905, 72.815], radius: 1500, baseFloodDays: 5 },
    { name: 'Worli', value: 'worli', center: [18.995, 72.825], radius: 1600, baseFloodDays: 7 },
  ],
  delhi: [
    { name: 'Connaught Place', value: 'connaught_place', center: [28.630, 77.220], radius: 2000, baseFloodDays: 4 },
    { name: 'Dwarka', value: 'dwarka', center: [28.580, 77.060], radius: 2500, baseFloodDays: 8 },
    { name: 'Rohini', value: 'rohini', center: [28.715, 77.115], radius: 2200, baseFloodDays: 7 },
    { name: 'Lajpat Nagar', value: 'lajpat_nagar', center: [28.565, 77.245], radius: 1800, baseFloodDays: 10 },
    { name: 'Karol Bagh', value: 'karol_bagh', center: [28.650, 77.195], radius: 2000, baseFloodDays: 6 },
  ],
  bengaluru: [
    { name: 'MG Road', value: 'mg_road', center: [12.975, 77.610], radius: 1500, baseFloodDays: 3 },
    { name: 'Whitefield', value: 'whitefield', center: [12.970, 77.740], radius: 2500, baseFloodDays: 9 },
    { name: 'Koramangala', value: 'koramangala', center: [12.935, 77.620], radius: 1800, baseFloodDays: 5 },
    { name: 'HSR Layout', value: 'hsr', center: [12.910, 77.650], radius: 1600, baseFloodDays: 7 },
    { name: 'Electronic City', value: 'electronic_city', center: [12.845, 77.670], radius: 3000, baseFloodDays: 11 },
  ],
  chennai: [
    { name: 'T Nagar', value: 't_nagar', center: [13.042, 80.234], radius: 1500, baseFloodDays: 6 },
    { name: 'Anna Nagar', value: 'anna_nagar', center: [13.085, 80.210], radius: 1800, baseFloodDays: 5 },
    { name: 'Marina Beach', value: 'marina_beach', center: [13.060, 80.280], radius: 2000, baseFloodDays: 12 },
  ],
  kolkata: [
    { name: 'Park Street', value: 'park_street', center: [22.552, 88.363], radius: 2000, baseFloodDays: 15 },
    { name: 'Salt Lake', value: 'salt_lake', center: [22.584, 88.419], radius: 2500, baseFloodDays: 12 },
    { name: 'Howrah', value: 'howrah', center: [22.595, 88.310], radius: 2000, baseFloodDays: 14 },
  ],
  hyderabad: [
    { name: 'Charminar', value: 'charminar', center: [17.361, 78.474], radius: 1500, baseFloodDays: 8 },
    { name: 'Jubilee Hills', value: 'jubilee_hills', center: [17.425, 78.408], radius: 1800, baseFloodDays: 4 },
    { name: 'Banjara Hills', value: 'banjara_hills', center: [17.430, 78.415], radius: 1500, baseFloodDays: 5 },
    { name: 'Cyberabad', value: 'cyberabad', center: [17.450, 78.380], radius: 2500, baseFloodDays: 6 },
  ],
  pune: [
    { name: 'Koregaon Park', value: 'koregaon_park', center: [18.536, 73.895], radius: 1500, baseFloodDays: 4 },
    { name: 'Hadapsar', value: 'hadapsar', center: [18.518, 73.945], radius: 2000, baseFloodDays: 7 },
    { name: 'Viman Nagar', value: 'viman_nagar', center: [18.568, 73.914], radius: 1800, baseFloodDays: 6 },
  ],
  ahmedabad: [
    { name: 'CG Road', value: 'cg_road', center: [23.032, 72.565], radius: 1500, baseFloodDays: 4 },
    { name: 'Satellite', value: 'satellite', center: [23.028, 72.510], radius: 2000, baseFloodDays: 5 },
    { name: 'SG Highway', value: 'sg_highway', center: [23.025, 72.530], radius: 2500, baseFloodDays: 6 },
  ],
  jaipur: [
    { name: 'C Scheme', value: 'c_scheme', center: [26.919, 75.788], radius: 1500, baseFloodDays: 3 },
    { name: 'Malviya Nagar', value: 'malviya_nagar', center: [26.853, 75.785], radius: 1800, baseFloodDays: 5 },
    { name: 'Vaishali', value: 'vaishali', center: [26.875, 75.760], radius: 1600, baseFloodDays: 4 },
  ],
  lucknow: [
    { name: 'Hazratganj', value: 'hazratganj', center: [26.850, 80.940], radius: 1500, baseFloodDays: 4 },
    { name: 'Gomti Nagar', value: 'gomti_nagar', center: [26.839, 81.010], radius: 2000, baseFloodDays: 6 },
    { name: 'Indiranagar', value: 'indiranagar', center: [26.848, 80.975], radius: 1800, baseFloodDays: 5 },
  ],
  chandigarh: [
    { name: 'Sector 17', value: 'sector_17', center: [30.740, 76.780], radius: 1500, baseFloodDays: 3 },
    { name: 'Sector 35', value: 'sector_35', center: [30.735, 76.755], radius: 1800, baseFloodDays: 4 },
    { name: 'Panchkula', value: 'panchkula', center: [30.690, 76.850], radius: 2000, baseFloodDays: 5 },
  ],
  indore: [
    { name: 'Rajwada', value: 'rajwada', center: [22.720, 75.855], radius: 1500, baseFloodDays: 4 },
    { name: 'Vijay Nagar', value: 'vijay_nagar', center: [22.752, 75.892], radius: 2000, baseFloodDays: 5 },
    { name: 'AB Bypass', value: 'ab_bypass', center: [22.735, 75.890], radius: 1800, baseFloodDays: 6 },
  ],
  bhopal: [
    { name: 'MP Nagar', value: 'mp_nagar', center: [23.233, 77.413], radius: 2000, baseFloodDays: 4 },
    { name: 'Kolar', value: 'kolar', center: [23.245, 77.430], radius: 1800, baseFloodDays: 5 },
    { name: 'New Market', value: 'new_market', center: [23.232, 77.395], radius: 1500, baseFloodDays: 3 },
  ],
  patna: [
    { name: 'Boring Road', value: 'boring_road', center: [25.595, 85.145], radius: 2000, baseFloodDays: 8 },
    { name: 'Kankarbagh', value: 'kankarbagh', center: [25.605, 85.165], radius: 1800, baseFloodDays: 7 },
    { name: 'Patna City', value: 'patna_city', center: [25.590, 85.180], radius: 2500, baseFloodDays: 10 },
  ],
  nagpur: [
    { name: 'Dharampeth', value: 'dharampeth', center: [21.148, 79.083], radius: 1500, baseFloodDays: 4 },
    { name: 'Civil Lines', value: 'civil_lines', center: [21.152, 79.090], radius: 1800, baseFloodDays: 5 },
    { name: 'Sitabuldi', value: 'sitabuldi', center: [21.145, 79.088], radius: 1500, baseFloodDays: 3 },
  ],
  ludhiana: [
    { name: 'Model Town', value: 'model_town', center: [30.915, 75.820], radius: 1800, baseFloodDays: 4 },
    { name: 'Civil Lines', value: 'civil_lines', center: [30.910, 75.840], radius: 1500, baseFloodDays: 3 },
    { name: 'PAU', value: 'pau', center: [30.920, 75.800], radius: 2000, baseFloodDays: 5 },
  ],
  meerut: [
    { name: 'Civil Lines', value: 'civil_lines', center: [28.984, 77.706], radius: 1500, baseFloodDays: 4 },
    { name: 'Meerut Cantt', value: 'cantt', center: [28.990, 77.720], radius: 1800, baseFloodDays: 5 },
    { name: 'Shastri Nagar', value: 'shastri_nagar', center: [28.978, 77.695], radius: 1600, baseFloodDays: 4 },
  ],
  agra: [
    { name: 'Tajganj', value: 'tajganj', center: [27.175, 78.015], radius: 2000, baseFloodDays: 6 },
    { name: 'Sanjay Place', value: 'sanjay_place', center: [27.185, 78.005], radius: 1500, baseFloodDays: 4 },
    { name: 'Kinari Bazaar', value: 'kinari_bazaar', center: [27.178, 78.008], radius: 1500, baseFloodDays: 5 },
  ],
  vadodara: [
    { name: 'Alkapuri', value: 'alkapuri', center: [22.310, 73.175], radius: 1500, baseFloodDays: 4 },
    { name: 'Akota', value: 'akota', center: [22.300, 73.180], radius: 1800, baseFloodDays: 5 },
    { name: 'Sayajigunj', value: 'sayajigunj', center: [22.320, 73.165], radius: 1600, baseFloodDays: 4 },
  ],
  surat: [
    { name: 'Ring Road', value: 'ring_road', center: [21.170, 72.830], radius: 2500, baseFloodDays: 7 },
    { name: 'Varachha', value: 'varachha', center: [21.180, 72.860], radius: 2000, baseFloodDays: 6 },
    { name: 'Adajan', value: 'adajan', center: [21.160, 72.790], radius: 1800, baseFloodDays: 5 },
  ],
  kochi: [
    { name: 'Marine Drive', value: 'marine_drive', center: [9.965, 76.245], radius: 1500, baseFloodDays: 9 },
    { name: 'Kakkanad', value: 'kakkanad', center: [9.980, 76.310], radius: 2500, baseFloodDays: 8 },
    { name: 'Edappally', value: 'edappally', center: [10.045, 76.305], radius: 2000, baseFloodDays: 7 },
  ],
  visakhapatnam: [
    { name: 'MVP Colony', value: 'mvp_colony', center: [17.730, 83.300], radius: 1800, baseFloodDays: 6 },
    { name: 'RK Beach', value: 'rk_beach', center: [17.725, 83.340], radius: 1500, baseFloodDays: 8 },
    { name: 'Rushikonda', value: 'rushikonda', center: [17.780, 83.360], radius: 2000, baseFloodDays: 5 },
  ],
  bhubaneswar: [
    { name: 'Bapuji Nagar', value: 'bapuji_nagar', center: [20.280, 85.830], radius: 1800, baseFloodDays: 5 },
    { name: 'Saheed Nagar', value: 'saheed_nagar', center: [20.290, 85.845], radius: 2000, baseFloodDays: 6 },
    { name: 'Unit 1', value: 'unit_1', center: [20.270, 85.820], radius: 1500, baseFloodDays: 4 },
    { name: 'Jaydev Vihar', value: 'jaydev_vihar', center: [20.295, 85.810], radius: 1600, baseFloodDays: 4 },
  ],
  cuttack: [
    { name: 'Buxi Bazaar', value: 'buxi_bazaar', center: [20.468, 85.880], radius: 1500, baseFloodDays: 8 },
    { name: 'Choudhary Bazar', value: 'choudhary_bazar', center: [20.472, 85.883], radius: 1200, baseFloodDays: 9 },
    { name: 'Sikharpur', value: 'sikharpur', center: [20.455, 85.865], radius: 1800, baseFloodDays: 7 },
    { name: 'Nayabazar', value: 'nayabazar', center: [20.465, 85.875], radius: 1400, baseFloodDays: 8 },
    { name: 'Mahanadi Vihar', value: 'mahanadi_vihar', center: [20.478, 85.870], radius: 2000, baseFloodDays: 10 },
  ],
  raipur: [
    { name: 'Pandri', value: 'pandri', center: [21.240, 81.620], radius: 1800, baseFloodDays: 5 },
    { name: 'Shankar Nagar', value: 'shankar_nagar', center: [21.250, 81.640], radius: 1500, baseFloodDays: 4 },
    { name: 'Rajendra Nagar', value: 'rajendra_nagar', center: [21.260, 81.630], radius: 2000, baseFloodDays: 6 },
  ],
  dehradun: [
    { name: 'Rajpur Road', value: 'rajpur_road', center: [30.340, 78.040], radius: 2000, baseFloodDays: 4 },
    { name: 'Mussoorie Road', value: 'mussoorie_road', center: [30.350, 78.060], radius: 1800, baseFloodDays: 5 },
    { name: 'Clock Tower', value: 'clock_tower', center: [30.325, 78.030], radius: 1500, baseFloodDays: 3 },
  ],
  jammu: [
    { name: 'Residency Road', value: 'residency_road', center: [32.730, 74.870], radius: 1500, baseFloodDays: 4 },
    { name: 'Gandhi Nagar', value: 'gandhi_nagar', center: [32.725, 74.860], radius: 1800, baseFloodDays: 5 },
    { name: 'Kanak Mandi', value: 'kanak_mandi', center: [32.740, 74.865], radius: 1600, baseFloodDays: 4 },
  ],
  srinagar: [
    { name: 'Lal Chowk', value: 'lal_chowk', center: [34.075, 74.810], radius: 1500, baseFloodDays: 6 },
    { name: 'Boulevard Road', value: 'boulevard_road', center: [34.085, 74.830], radius: 2000, baseFloodDays: 5 },
    { name: 'Rajbagh', value: 'rajbagh', center: [34.070, 74.795], radius: 1800, baseFloodDays: 7 },
  ],
  guwahati: [
    { name: 'Pan Bazar', value: 'pan_bazar', center: [26.180, 91.750], radius: 1500, baseFloodDays: 8 },
    { name: 'Ulubari', value: 'ulubari', center: [26.170, 91.760], radius: 1800, baseFloodDays: 7 },
    { name: 'Dispur', value: 'dispur', center: [26.145, 91.770], radius: 2000, baseFloodDays: 5 },
  ],
  coimbatore: [
    { name: 'RS Puram', value: 'rs_puram', center: [11.015, 76.955], radius: 1500, baseFloodDays: 4 },
    { name: 'Peelamedu', value: 'peelamedu', center: [11.025, 76.970], radius: 2000, baseFloodDays: 5 },
    { name: 'Gandhipuram', value: 'gandhipuram', center: [11.020, 76.960], radius: 1500, baseFloodDays: 4 },
  ],
  mangalore: [
    { name: 'Bejai', value: 'bejai', center: [12.870, 74.840], radius: 1500, baseFloodDays: 6 },
    { name: 'Hampankatta', value: 'hampankatta', center: [12.865, 74.845], radius: 1500, baseFloodDays: 5 },
    { name: 'Valencia', value: 'valencia', center: [12.880, 74.850], radius: 1800, baseFloodDays: 7 },
  ],
  mysore: [
    { name: 'Devaraja Market', value: 'devaraja_market', center: [12.305, 76.650], radius: 1500, baseFloodDays: 5 },
    { name: 'Vijayanagar', value: 'vijayanagar', center: [12.310, 76.630], radius: 1800, baseFloodDays: 4 },
    { name: 'Lalitha Mahal', value: 'lalitha_mahal', center: [12.320, 76.660], radius: 2000, baseFloodDays: 4 },
  ],
  default: [
    { name: 'City Center', value: 'city_center', center: [0, 0], radius: 2000, baseFloodDays: 5 },
    { name: 'East Side', value: 'east_side', center: [0.010, 0], radius: 1800, baseFloodDays: 6 },
    { name: 'West Side', value: 'west_side', center: [-0.010, 0], radius: 1800, baseFloodDays: 4 },
    { name: 'North Zone', value: 'north_zone', center: [0.015, 0], radius: 1500, baseFloodDays: 4 },
    { name: 'South Zone', value: 'south_zone', center: [-0.015, 0], radius: 1500, baseFloodDays: 6 },
  ],
};

const DEG_TO_METERS = 111000;

export const calculateRiskFromML = (lat, lng, cityKey = null) => {
  let targetCity = cityKey;
  
  if (!targetCity) {
    const cities = Object.entries(CITY_COORDS);
    let minDist = Infinity;
    cities.forEach(([key, coords]) => {
      const dist = Math.sqrt(Math.pow(lat - coords.lat, 2) + Math.pow(lng - coords.lng, 2));
      if (dist < minDist) {
        minDist = dist;
        targetCity = key;
      }
    });
  }
  
  const zones = ZONE_CIRCLES[targetCity] || ZONE_CIRCLES.default;
  
  let nearestZone = null;
  let minDistanceMeters = Infinity;
  
  zones.forEach(zone => {
    const distanceDeg = Math.sqrt(
      Math.pow(lat - zone.center[0], 2) + Math.pow(lng - zone.center[1], 2)
    );
    const distanceMeters = distanceDeg * DEG_TO_METERS;
    if (distanceMeters < minDistanceMeters) {
      minDistanceMeters = distanceMeters;
      nearestZone = zone;
    }
  });
  
  if (!nearestZone) {
    return { 
      risk: 'MEDIUM', 
      baseAdj: 1.0, 
      floodDays: 6,
      zoneName: 'City Center',
      zoneValue: 'city_center',
      city: targetCity
    };
  }
  
  const distanceFactor = Math.max(0, Math.min(1, 1 - ((minDistanceMeters - nearestZone.radius) / nearestZone.radius)));
  
  let effectiveFloodDays;
  if (minDistanceMeters <= nearestZone.radius) {
    effectiveFloodDays = nearestZone.baseFloodDays;
  } else {
    const outsideFactor = Math.max(0.3, 1 - ((minDistanceMeters - nearestZone.radius) / (nearestZone.radius * 2)));
    effectiveFloodDays = Math.round(nearestZone.baseFloodDays * outsideFactor);
  }
  
  let risk, baseAdj;
  if (effectiveFloodDays >= 12) {
    risk = 'EXTREME';
    baseAdj = 1.5;
  } else if (effectiveFloodDays >= 8) {
    risk = 'HIGH';
    baseAdj = 1.3;
  } else if (effectiveFloodDays >= 4) {
    risk = 'MEDIUM';
    baseAdj = 1.0;
  } else {
    risk = 'LOW';
    baseAdj = 0.8;
  }
  
  return {
    risk,
    baseAdj,
    floodDays: effectiveFloodDays,
    zoneName: nearestZone.name,
    zoneValue: nearestZone.value,
    city: targetCity,
    distanceMeters: minDistanceMeters,
    withinZone: minDistanceMeters <= nearestZone.radius
  };
};
