// Location API utilities for fetching countries and regions

export interface Country {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  cca3: string;
  region: string;
  subregion?: string;
  capital?: string[];
  population: number;
}

export interface City {
  name: string;
  country: string;
  region: string;
  population?: number;
}

// Cache for countries to avoid repeated API calls
let countriesCache: Country[] | null = null;

/**
 * Fetch all countries from REST Countries API
 */
export async function fetchCountries(): Promise<Country[]> {
  if (countriesCache) {
    return countriesCache;
  }

  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,cca3,region,subregion,capital,population');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const countries: Country[] = await response.json();
    
    // Sort countries alphabetically by common name
    countriesCache = countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
    
    console.log('📍 Fetched', countriesCache.length, 'countries from REST Countries API');
    return countriesCache;
  } catch (error) {
    console.error('Failed to fetch countries:', error);
    return [];
  }
}

/**
 * Get popular countries for quick selection
 */
export function getPopularCountries(): string[] {
  return [
    'United States',
    'United Kingdom', 
    'Canada',
    'Australia',
    'Germany',
    'France',
    'Netherlands',
    'Singapore',
    'India',
    'Brazil',
    'Mexico',
    'Japan',
    'China',
    'South Africa',
    'Italy',
    'Spain',
    'New Zealand',
    'Norway',
    'Sweden',
    'Denmark',
    'Switzerland',
    'Belgium',
    'Austria',
    'Portugal',
    'Ireland'
  ];
}

/**
 * Get major cities for a given country
 * This is a simplified implementation - in production you'd use a cities API
 */
export function getMajorCities(country: string): string[] {
  const cityDatabase: { [key: string]: string[] } = {
    'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington DC', 'Boston', 'Nashville', 'Baltimore', 'Oklahoma City', 'Portland', 'Las Vegas', 'Louisville', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Mesa', 'Kansas City', 'Atlanta', 'Omaha', 'Colorado Springs', 'Raleigh', 'Miami', 'Long Beach', 'Virginia Beach', 'Minneapolis', 'Tampa', 'Oakland', 'New Orleans', 'Wichita', 'Arlington', 'Cleveland', 'Bakersfield', 'Honolulu'],
    'United Kingdom': ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Edinburgh', 'Bristol', 'Leicester', 'Coventry', 'Kingston upon Hull', 'Bradford', 'Cardiff', 'Belfast', 'Stoke-on-Trent', 'Wolverhampton', 'Plymouth', 'Nottingham', 'Southampton', 'Reading', 'Derby', 'Dudley', 'Northampton', 'Portsmouth', 'Newcastle upon Tyne', 'Luton', 'Swindon', 'Southend-on-Sea', 'Middlesbrough'],
    'Canada': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Victoria', 'Halifax', 'Oshawa', 'Windsor', 'Saskatoon', 'St. Catharines', 'Regina', 'Sherbrooke', 'Barrie', 'Kelowna', 'Abbotsford', 'Kingston', 'Trois-Rivières', 'Guelph', 'Cambridge', 'Whitby', 'Waterloo', 'Coquitlam', 'Brantford'],
    'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Central Coast', 'Wollongong', 'Logan City', 'Geelong', 'Hobart', 'Townsville', 'Cairns', 'Darwin', 'Toowoomba', 'Ballarat', 'Bendigo', 'Albury', 'Launceston', 'Mackay', 'Rockhampton', 'Bunbury', 'Bundaberg', 'Coffs Harbour', 'Wagga Wagga', 'Hervey Bay', 'Mildura', 'Shepparton'],
    'Germany': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt am Main', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig', 'Bremen', 'Dresden', 'Hanover', 'Nuremberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster', 'Karlsruhe', 'Mannheim', 'Augsburg', 'Wiesbaden', 'Gelsenkirchen', 'Mönchengladbach', 'Braunschweig', 'Chemnitz', 'Kiel', 'Aachen'],
    'France': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne', 'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne', 'Saint-Denis', 'Le Mans', 'Aix-en-Provence', 'Clermont-Ferrand', 'Brest', 'Tours', 'Limoges', 'Amiens', 'Perpignan', 'Metz'],
    'Netherlands': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen', 'Enschede', 'Haarlem', 'Arnhem', 'Zaanstad', 'Amersfoort', 'Apeldoorn', 'Den Bosch', 'Hoofddorp', 'Maastricht', 'Leiden', 'Dordrecht', 'Zoetermeer', 'Zwolle', 'Deventer', 'Delft', 'Alkmaar', 'Leeuwarden', 'Venlo', 'Hilversum', 'Emmen'],
    'India': ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Surat', 'Jaipur', 'Kanpur', 'Lucknow', 'Nagpur', 'Patna', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Vadodara', 'Firozabad', 'Ludhiana', 'Rajkot', 'Agra', 'Siliguri', 'Nashik', 'Faridabad', 'Patiala', 'Meerut', 'Kalyan-Dombivali', 'Vasai-Virar'],
    'Singapore': ['Singapore'],
    'Japan': ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Kawasaki', 'Saitama', 'Hiroshima', 'Sendai', 'Kitakyushu', 'Chiba', 'Sakai', 'Niigata', 'Hamamatsu', 'Kumamoto', 'Sagamihara', 'Shizuoka', 'Okayama', 'Kagoshima', 'Funabashi', 'Hachioji', 'Kawaguchi', 'Himeji', 'Suita', 'Utsunomiya', 'Matsuyama', 'Chiba'],
    'China': ['Shanghai', 'Beijing', 'Chongqing', 'Tianjin', 'Guangzhou', 'Shenzhen', 'Wuhan', 'Dongguan', 'Chengdu', 'Nanjing', 'Foshan', 'Shenyang', 'Hangzhou', 'Xi\'an', 'Harbin', 'Suzhou', 'Qingdao', 'Dalian', 'Zhengzhou', 'Shantou', 'Jinan', 'Changchun', 'Kunming', 'Changsha', 'Taiyuan', 'Xiamen', 'Hefei', 'Shijiazhuang', 'Urumqi', 'Zibo'],
    'Brazil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Goiânia', 'Belém', 'Porto Alegre', 'Guarulhos', 'Campinas', 'São Luís', 'São Gonçalo', 'Maceió', 'Duque de Caxias', 'Teresina', 'Natal', 'Campo Grande', 'Nova Iguaçu', 'São Bernardo do Campo', 'João Pessoa', 'Santo André', 'Osasco', 'Jaboatão dos Guararapes', 'São José dos Campos', 'Ribeirão Preto', 'Uberlândia'],
    'Other': []
  };

  return cityDatabase[country] || [];
}

/**
 * Search countries by name (fuzzy search)
 */
export function searchCountries(query: string, countries: Country[]): Country[] {
  if (!query.trim()) return countries;
  
  const searchTerm = query.toLowerCase();
  return countries.filter(country => 
    country.name.common.toLowerCase().includes(searchTerm) ||
    country.name.official.toLowerCase().includes(searchTerm)
  );
}

/**
 * Get country regions/states/provinces
 * This uses our predefined mapping - in production you'd use a regions API
 */
export function getCountryRegions(countryName: string): string[] {
  const countryRegions: { [key: string]: string[] } = {
    'United States': ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
    'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
    'Canada': ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'],
    'Australia': ['Australian Capital Territory', 'New South Wales', 'Northern Territory', 'Queensland', 'South Australia', 'Tasmania', 'Victoria', 'Western Australia'],
    'Germany': ['Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hesse', 'Lower Saxony', 'Mecklenburg-Vorpommern', 'North Rhine-Westphalia', 'Rhineland-Palatinate', 'Saarland', 'Saxony', 'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia'],
    'France': ['Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Brittany', 'Centre-Val de Loire', 'Corsica', 'Grand Est', 'Hauts-de-France', 'Île-de-France', 'Normandy', 'Nouvelle-Aquitaine', 'Occitanie', 'Pays de la Loire', 'Provence-Alpes-Côte d\'Azur'],
    'India': ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'],
    'Netherlands': ['Drenthe', 'Flevoland', 'Friesland', 'Gelderland', 'Groningen', 'Limburg', 'North Brabant', 'North Holland', 'Overijssel', 'South Holland', 'Utrecht', 'Zeeland'],
    'Brazil': ['Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal', 'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí', 'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia', 'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins'],
    'Mexico': ['Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'],
    'Italy': ['Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna', 'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardy', 'Marche', 'Molise', 'Piedmont', 'Puglia', 'Sardinia', 'Sicily', 'Tuscany', 'Trentino-Alto Adige', 'Umbria', "Aosta Valley", 'Veneto'],
    'Spain': ['Andalusia', 'Aragon', 'Asturias', 'Balearic Islands', 'Basque Country', 'Canary Islands', 'Cantabria', 'Castile and León', 'Castile-La Mancha', 'Catalonia', 'Extremadura', 'Galicia', 'La Rioja', 'Madrid', 'Murcia', 'Navarre', 'Valencia'],
    'Japan': ['Aichi', 'Akita', 'Aomori', 'Chiba', 'Ehime', 'Fukui', 'Fukuoka', 'Fukushima', 'Gifu', 'Gunma', 'Hiroshima', 'Hokkaido', 'Hyogo', 'Ibaraki', 'Ishikawa', 'Iwate', 'Kagawa', 'Kagoshima', 'Kanagawa', 'Kochi', 'Kumamoto', 'Kyoto', 'Mie', 'Miyagi', 'Miyazaki', 'Nagano', 'Nagasaki', 'Nara', 'Niigata', 'Oita', 'Okayama', 'Okinawa', 'Osaka', 'Saga', 'Saitama', 'Shiga', 'Shimane', 'Shizuoka', 'Tochigi', 'Tokushima', 'Tokyo', 'Tottori', 'Toyama', 'Wakayama', 'Yamagata', 'Yamaguchi', 'Yamanashi'],
    'China': ['Anhui', 'Beijing', 'Chongqing', 'Fujian', 'Gansu', 'Guangdong', 'Guangxi', 'Guizhou', 'Hainan', 'Hebei', 'Heilongjiang', 'Henan', 'Hong Kong', 'Hubei', 'Hunan', 'Inner Mongolia', 'Jiangsu', 'Jiangxi', 'Jilin', 'Liaoning', 'Macau', 'Ningxia', 'Qinghai', 'Shaanxi', 'Shandong', 'Shanghai', 'Shanxi', 'Sichuan', 'Tianjin', 'Tibet', 'Xinjiang', 'Yunnan', 'Zhejiang'],
    'South Africa': ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'],
    'Norway': ['Agder', 'Innlandet', 'Møre og Romsdal', 'Nordland', 'Oslo', 'Rogaland', 'Troms og Finnmark', 'Trøndelag', 'Vestfold og Telemark', 'Vestland', 'Viken'],
    'Sweden': ['Blekinge', 'Dalarna', 'Gävleborg', 'Gotland', 'Halland', 'Jämtland', 'Jönköping', 'Kalmar', 'Kronoberg', 'Norrbotten', 'Örebro', 'Östergötland', 'Skåne', 'Södermanland', 'Stockholm', 'Uppsala', 'Värmland', 'Västerbotten', 'Västernorrland', 'Västmanland', 'Västra Götaland'],
    'Denmark': ['Capital Region', 'Central Denmark', 'North Denmark', 'Zealand', 'Southern Denmark'],
    'Switzerland': ['Aargau', 'Appenzell Ausserrhoden', 'Appenzell Innerrhoden', 'Basel-Landschaft', 'Basel-Stadt', 'Bern', 'Fribourg', 'Geneva', 'Glarus', 'Graubünden', 'Jura', 'Lucerne', 'Neuchâtel', 'Nidwalden', 'Obwalden', 'Schaffhausen', 'Schwyz', 'Solothurn', 'St. Gallen', 'Thurgau', 'Ticino', 'Uri', 'Valais', 'Vaud', 'Zug', 'Zurich'],
    'Belgium': ['Antwerp', 'Brussels', 'East Flanders', 'Flemish Brabant', 'Hainaut', 'Liège', 'Limburg', 'Luxembourg', 'Namur', 'Walloon Brabant', 'West Flanders'],
    'Austria': ['Burgenland', 'Carinthia', 'Lower Austria', 'Upper Austria', 'Salzburg', 'Styria', 'Tyrol', 'Vorarlberg', 'Vienna'],
    'Portugal': ['Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco', 'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria', 'Lisboa', 'Portalegre', 'Porto', 'Santarém', 'Setúbal', 'Viana do Castelo', 'Vila Real', 'Viseu', 'Azores', 'Madeira'],
    'Ireland': ['Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway', 'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow'],
    'New Zealand': ['Auckland', 'Bay of Plenty', 'Canterbury', 'Gisborne', "Hawke's Bay", 'Manawatu-Wanganui', 'Marlborough', 'Nelson', 'Northland', 'Otago', 'Southland', 'Taranaki', 'Tasman', 'Waikato', 'Wellington', 'West Coast'],
    'Singapore': ['Central Region', 'East Region', 'North Region', 'North-East Region', 'West Region'],
    'Other': ['Please specify in region field']
  };

  return countryRegions[countryName] || ['Please specify in region field'];
} 