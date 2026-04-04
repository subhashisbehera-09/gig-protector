import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { ZoneMap } from '../components/ZoneMap';
import { calculateRiskFromML } from '../utils/zoneUtils';

const STEPS = [
  { num: 1, label: 'Identity' },
  { num: 2, label: 'Platform' },
  { num: 3, label: 'Zone' },
  { num: 4, label: 'Payment' },
  { num: 5, label: 'Complete' },
];

const PLATFORM_LOGOS = {
  zomato: (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="45" fill="#E23744" />
      <path d="M50 20C35 20 25 35 25 50C25 70 50 85 50 85C50 85 75 70 75 50C75 35 65 20 50 20Z" fill="white" />
      <circle cx="50" cy="45" r="8" fill="#E23744" />
    </svg>
  ),
  swiggy: (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="45" fill="#FF5200" />
      <path d="M30 55C30 55 40 35 50 35C60 35 70 55 70 55" stroke="white" strokeWidth="6" strokeLinecap="round" />
      <circle cx="38" cy="55" r="6" fill="white" />
      <circle cx="62" cy="55" r="6" fill="white" />
      <path d="M35 68L50 78L65 68" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  swiggy_instamart: (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="45" fill="#FF6B35" />
      <path d="M30 45H70M30 55H70M30 65H50" stroke="white" strokeWidth="5" strokeLinecap="round" />
    </svg>
  ),
  zepto: (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="45" fill="#9D4DFF" />
      <text x="50" y="62" textAnchor="middle" fill="white" fontSize="36" fontWeight="bold">Z</text>
    </svg>
  ),
  blinkit: (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="45" fill="#FFD000" />
      <path d="M35 65L50 35L65 65H35Z" fill="#1a1a1a" />
      <rect x="45" y="55" width="10" height="15" fill="#1a1a1a" />
    </svg>
  ),
  amazon: (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="45" fill="#FF9900" />
      <text x="50" y="60" textAnchor="middle" fill="white" fontSize="32" fontWeight="bold">a</text>
    </svg>
  ),
  myntra: (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="45" fill="#E80063" />
      <path d="M50 30L65 70H35L50 30Z" fill="white" />
    </svg>
  ),
  flipkart: (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="45" fill="#2874F0" />
      <text x="50" y="58" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold">f</text>
    </svg>
  ),
  dunzo: (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="45" fill="#00B4A0" />
      <circle cx="40" cy="45" r="8" fill="white" />
      <circle cx="60" cy="45" r="8" fill="white" />
      <path d="M35 60C35 60 45 75 50 75C55 75 65 60 65 60" stroke="white" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
  bigbasket: (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="45" fill="#84C341" />
      <rect x="35" y="40" width="30" height="25" rx="3" fill="white" />
      <rect x="40" y="35" width="20" height="8" rx="2" fill="white" />
    </svg>
  ),
  ubereats: (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="45" fill="#06C167" />
      <path d="M40 45L50 35L60 45L55 45L55 60L45 60L45 45Z" fill="white" />
    </svg>
  ),
  dominos: (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="45" fill="#0B5494" />
      <circle cx="40" cy="45" r="6" fill="white" />
      <circle cx="55" cy="40" r="4" fill="white" />
      <circle cx="60" cy="55" r="5" fill="white" />
      <circle cx="45" cy="58" r="4" fill="white" />
    </svg>
  ),
};

const PLATFORMS = [
  { value: 'zomato', label: 'Zomato', logo: PLATFORM_LOGOS.zomato, color: '#E23744', rgb: '226, 55, 68' },
  { value: 'swiggy', label: 'Swiggy', logo: PLATFORM_LOGOS.swiggy, color: '#FF5200', rgb: '255, 82, 0' },
  { value: 'swiggy_instamart', label: 'Instamart', logo: PLATFORM_LOGOS.swiggy_instamart, color: '#FF6B35', rgb: '255, 107, 53' },
  { value: 'zepto', label: 'Zepto', logo: PLATFORM_LOGOS.zepto, color: '#9D4DFF', rgb: '157, 77, 255' },
  { value: 'blinkit', label: 'Blinkit', logo: PLATFORM_LOGOS.blinkit, color: '#FFD000', rgb: '255, 208, 0' },
  { value: 'amazon', label: 'Amazon Flex', logo: PLATFORM_LOGOS.amazon, color: '#FF9900', rgb: '255, 153, 0' },
  { value: 'myntra', label: 'Myntra', logo: PLATFORM_LOGOS.myntra, color: '#E80063', rgb: '232, 0, 99' },
  { value: 'flipkart', label: 'Flipkart', logo: PLATFORM_LOGOS.flipkart, color: '#2874F0', rgb: '40, 116, 240' },
  { value: 'dunzo', label: 'Dunzo', logo: PLATFORM_LOGOS.dunzo, color: '#00B4A0', rgb: '0, 180, 160' },
  { value: 'bigbasket', label: 'BigBasket', logo: PLATFORM_LOGOS.bigbasket, color: '#84C341', rgb: '132, 195, 65' },
  { value: 'ubereats', label: 'Uber Eats', logo: PLATFORM_LOGOS.ubereats, color: '#06C167', rgb: '6, 193, 103' },
  { value: 'dominos', label: "Domino's", logo: PLATFORM_LOGOS.dominos, color: '#0B5494', rgb: '11, 84, 148' },
];

const CITIES = [
  { value: 'current_location', label: '📍 Use Current Location', tier: 0 },
  { value: 'mumbai', label: 'Mumbai', tier: 1 },
  { value: 'delhi', label: 'Delhi NCR', tier: 1 },
  { value: 'bengaluru', label: 'Bengaluru', tier: 1 },
  { value: 'chennai', label: 'Chennai', tier: 1 },
  { value: 'hyderabad', label: 'Hyderabad', tier: 1 },
  { value: 'kolkata', label: 'Kolkata', tier: 1 },
  { value: 'pune', label: 'Pune', tier: 2 },
  { value: 'ahmedabad', label: 'Ahmedabad', tier: 2 },
  { value: 'jaipur', label: 'Jaipur', tier: 2 },
  { value: 'lucknow', label: 'Lucknow', tier: 2 },
  { value: 'chandigarh', label: 'Chandigarh', tier: 2 },
  { value: 'indore', label: 'Indore', tier: 2 },
  { value: 'kochi', label: 'Kochi', tier: 2 },
  { value: 'visakhapatnam', label: 'Visakhapatnam', tier: 2 },
  { value: 'surat', label: 'Surat', tier: 2 },
  { value: 'vadodara', label: 'Vadodara', tier: 2 },
  { value: 'nagpur', label: 'Nagpur', tier: 2 },
  { value: 'mohali', label: 'Mohali', tier: 2 },
  { value: 'dehradun', label: 'Dehradun', tier: 3 },
  { value: 'bhopal', label: 'Bhopal', tier: 3 },
  { value: 'mangalore', label: 'Mangalore', tier: 3 },
  { value: 'coimbatore', label: 'Coimbatore', tier: 3 },
  { value: 'patna', label: 'Patna', tier: 3 },
  { value: 'guwahati', label: 'Guwahati', tier: 3 },
  { value: 'thiruvananthapuram', label: 'Thiruvananthapuram', tier: 3 },
  { value: 'ludhiana', label: 'Ludhiana', tier: 3 },
  { value: 'jalandhar', label: 'Jalandhar', tier: 3 },
  { value: 'amritsar', label: 'Amritsar', tier: 3 },
  { value: 'varanasi', label: 'Varanasi', tier: 3 },
  { value: 'prayagraj', label: 'Prayagraj', tier: 3 },
  { value: 'ranchi', label: 'Ranchi', tier: 3 },
  { value: 'bhubaneswar', label: 'Bhubaneswar', tier: 3 },
  { value: 'cuttack', label: 'Cuttack', tier: 3 },
  { value: 'madhurai', label: 'Madurai', tier: 3 },
  { value: 'tiruchirappalli', label: 'Tiruchirappalli', tier: 3 },
  { value: 'mysore', label: 'Mysore', tier: 3 },
  { value: 'hubli', label: 'Hubli', tier: 3 },
  { value: 'belgaum', label: 'Belgaum', tier: 3 },
  { value: 'aurangabad', label: 'Aurangabad', tier: 3 },
  { value: 'nashik', label: 'Nashik', tier: 3 },
  { value: 'kota', label: 'Kota', tier: 3 },
  { value: 'udaipur', label: 'Udaipur', tier: 3 },
  { value: 'jodhpur', label: 'Jodhpur', tier: 3 },
  { value: 'trivandrum', label: 'Trivandrum', tier: 3 },
  { value: 'other', label: '🌐 Other City (Manual Entry)', tier: 3 },
];

const ZONES = {
  mumbai: [
    { value: 'andheri_west', label: 'Andheri West', risk: 'HIGH', baseAdj: 1.3 },
    { value: 'kurla', label: 'Kurla', risk: 'HIGH', baseAdj: 1.25 },
    { value: 'bandra', label: 'Bandra', risk: 'MEDIUM', baseAdj: 1.0 },
    { value: 'dadar', label: 'Dadar', risk: 'MEDIUM', baseAdj: 1.1 },
    { value: 'colaba', label: 'Colaba', risk: 'LOW', baseAdj: 0.8 },
  ],
  delhi: [
    { value: 'connaught_place', label: 'Connaught Place', risk: 'LOW', baseAdj: 0.85 },
    { value: 'dwarka', label: 'Dwarka', risk: 'MEDIUM', baseAdj: 1.15 },
    { value: 'rohini', label: 'Rohini', risk: 'MEDIUM', baseAdj: 1.1 },
    { value: 'lajpat_nagar', label: 'Lajpat Nagar', risk: 'HIGH', baseAdj: 1.2 },
  ],
  bengaluru: [
    { value: 'mg_road', label: 'MG Road', risk: 'LOW', baseAdj: 0.85 },
    { value: 'whitefield', label: 'Whitefield', risk: 'MEDIUM', baseAdj: 1.2 },
    { value: 'koramangala', label: 'Koramangala', risk: 'LOW', baseAdj: 0.9 },
    { value: 'hsr', label: 'HSR Layout', risk: 'MEDIUM', baseAdj: 1.05 },
  ],
  chennai: [
    { value: 't_nagar', label: 'T. Nagar', risk: 'LOW', baseAdj: 0.85 },
    { value: 'anna_nagar', label: 'Anna Nagar', risk: 'LOW', baseAdj: 0.9 },
    { value: 'tambaram', label: 'Tambaram', risk: 'MEDIUM', baseAdj: 1.1 },
  ],
  hyderabad: [
    { value: 'jubilee_hills', label: 'Jubilee Hills', risk: 'LOW', baseAdj: 0.9 },
    { value: 'banjara_hills', label: 'Banjara Hills', risk: 'LOW', baseAdj: 0.85 },
    { value: 'gachibowli', label: 'Gachibowli', risk: 'MEDIUM', baseAdj: 1.1 },
  ],
  kolkata: [
    { value: 'park_street', label: 'Park Street', risk: 'LOW', baseAdj: 0.85 },
    { value: 'salt_lake', label: 'Salt Lake', risk: 'MEDIUM', baseAdj: 1.05 },
    { value: 'newtown', label: 'Newtown', risk: 'MEDIUM', baseAdj: 1.1 },
  ],
  pune: [
    { value: 'koregaon_park', label: 'Koregaon Park', risk: 'LOW', baseAdj: 0.85 },
    { value: 'hadapsar', label: 'Hadapsar', risk: 'MEDIUM', baseAdj: 1.1 },
    { value: 'wakad', label: 'Wakad', risk: 'MEDIUM', baseAdj: 1.05 },
  ],
  ahmedabad: [
    { value: 'cg_road', label: 'CG Road', risk: 'LOW', baseAdj: 0.85 },
    { value: 'satellite', label: 'Satellite', risk: 'MEDIUM', baseAdj: 1.0 },
    { value: 'sg_highway', label: 'SG Highway', risk: 'MEDIUM', baseAdj: 1.05 },
  ],
  jaipur: [
    { value: 'c_scheme', label: 'C-Scheme', risk: 'LOW', baseAdj: 0.85 },
    { value: 'malviya_nagar', label: 'Malviya Nagar', risk: 'MEDIUM', baseAdj: 1.0 },
    { value: 'vaishali', label: 'Vaishali', risk: 'MEDIUM', baseAdj: 1.05 },
  ],
  lucknow: [
    { value: 'hazratganj', label: 'Hazratganj', risk: 'LOW', baseAdj: 0.85 },
    { value: 'gomti_nagar', label: 'Gomti Nagar', risk: 'LOW', baseAdj: 0.9 },
    { value: 'indiranagar', label: 'Indiranagar', risk: 'MEDIUM', baseAdj: 1.05 },
  ],
  chandigarh: [
    { value: 'sector_17', label: 'Sector 17', risk: 'LOW', baseAdj: 0.8 },
    { value: 'sector_35', label: 'Sector 35', risk: 'LOW', baseAdj: 0.85 },
    { value: 'panchkula', label: 'Panchkula', risk: 'MEDIUM', baseAdj: 1.0 },
  ],
  indore: [
    { value: 'rajwada', label: 'Rajwada', risk: 'LOW', baseAdj: 0.85 },
    { value: 'vijay_nagar', label: 'Vijay Nagar', risk: 'LOW', baseAdj: 0.9 },
    { value: 'ab_bypass', label: 'AB Bypass', risk: 'MEDIUM', baseAdj: 1.05 },
  ],
  kochi: [
    { value: 'marine_drive', label: 'Marine Drive', risk: 'MEDIUM', baseAdj: 1.1 },
    { value: 'kakkanad', label: 'Kakkanad', risk: 'MEDIUM', baseAdj: 1.0 },
    { value: 'edappally', label: 'Edappally', risk: 'LOW', baseAdj: 0.95 },
  ],
  visakhapatnam: [
    { value: 'mvp_colony', label: 'MVP Colony', risk: 'LOW', baseAdj: 0.85 },
    { value: 'rk_beach', label: 'RK Beach', risk: 'MEDIUM', baseAdj: 1.1 },
    { value: 'rushikonda', label: 'Rushikonda', risk: 'LOW', baseAdj: 0.9 },
  ],
  bhopal: [
    { value: 'mp_nagar', label: 'MP Nagar', risk: 'LOW', baseAdj: 0.85 },
    { value: 'kolar', label: 'Kolar', risk: 'MEDIUM', baseAdj: 1.0 },
  ],
  nagpur: [
    { value: 'dharampeth', label: 'Dharampeth', risk: 'LOW', baseAdj: 0.85 },
    { value: 'civil_lines', label: 'Civil Lines', risk: 'LOW', baseAdj: 0.9 },
  ],
  mangalore: [
    { value: 'bejai', label: 'Bejai', risk: 'LOW', baseAdj: 0.85 },
    { value: 'hampankatta', label: 'Hampankatta', risk: 'LOW', baseAdj: 0.9 },
  ],
  coimbatore: [
    { value: 'rs_puram', label: 'RS Puram', risk: 'LOW', baseAdj: 0.85 },
    { value: 'peelamedu', label: 'Peelamedu', risk: 'MEDIUM', baseAdj: 1.0 },
  ],
  patna: [
    { value: 'boring_road', label: 'Boring Road', risk: 'MEDIUM', baseAdj: 1.05 },
    { value: 'kankarbagh', label: 'Kankarbagh', risk: 'MEDIUM', baseAdj: 1.0 },
  ],
  guwahati: [
    { value: 'pan_bazar', label: 'Pan Bazar', risk: 'LOW', baseAdj: 0.85 },
    { value: 'ulubari', label: 'Ulubari', risk: 'LOW', baseAdj: 0.9 },
  ],
  surat: [
    { value: 'ring_road', label: 'Ring Road', risk: 'LOW', baseAdj: 0.85 },
    { value: 'varachha', label: 'Varachha', risk: 'MEDIUM', baseAdj: 1.0 },
  ],
  vadodara: [
    { value: 'alkapuri', label: 'Alkapuri', risk: 'LOW', baseAdj: 0.85 },
    { value: 'akota', label: 'Akota', risk: 'LOW', baseAdj: 0.9 },
  ],
  mohali: [
    { value: 'phase_7', label: 'Phase 7', risk: 'LOW', baseAdj: 0.85 },
    { value: 'sector_70', label: 'Sector 70', risk: 'LOW', baseAdj: 0.88 },
  ],
  dehradun: [
    { value: 'rajpur_road', label: 'Rajpur Road', risk: 'LOW', baseAdj: 0.85 },
    { value: 'mussoorie_road', label: 'Mussoorie Road', risk: 'LOW', baseAdj: 0.88 },
  ],
  thiruvananthapuram: [
    { value: 'mg_road', label: 'MG Road', risk: 'LOW', baseAdj: 0.85 },
    { value: 'kovalam', label: 'Kovalam', risk: 'MEDIUM', baseAdj: 1.05 },
  ],
  ludhiana: [
    { value: 'model_town', label: 'Model Town', risk: 'LOW', baseAdj: 0.85 },
    { value: 'civil_lines', label: 'Civil Lines', risk: 'LOW', baseAdj: 0.88 },
  ],
  jalandhar: [
    { value: 'model_town', label: 'Model Town', risk: 'LOW', baseAdj: 0.85 },
    { value: 'civil_lines', label: 'Civil Lines', risk: 'LOW', baseAdj: 0.88 },
  ],
  amritsar: [
    { value: 'market', label: 'Market', risk: 'LOW', baseAdj: 0.85 },
    { value: 'ranjit_avenue', label: 'Ranjit Avenue', risk: 'LOW', baseAdj: 0.88 },
  ],
  varanasi: [
    { value: 'godowlia', label: 'Godowlia', risk: 'LOW', baseAdj: 0.85 },
    { value: 'cantt', label: 'Cantt', risk: 'MEDIUM', baseAdj: 1.0 },
  ],
  prayagraj: [
    { value: 'civil_lines', label: 'Civil Lines', risk: 'LOW', baseAdj: 0.85 },
    { value: 'lowther_road', label: 'Lowther Road', risk: 'LOW', baseAdj: 0.88 },
  ],
  ranchi: [
    { value: 'main_road', label: 'Main Road', risk: 'LOW', baseAdj: 0.85 },
    { value: 'hinoo', label: 'Hinoo', risk: 'MEDIUM', baseAdj: 1.0 },
  ],
  bhubaneswar: [
    { value: 'bapuji_nagar', label: 'Bapuji Nagar', risk: 'LOW', baseAdj: 0.85 },
    { value: 'saheed_nagar', label: 'Saheed Nagar', risk: 'MEDIUM', baseAdj: 1.0 },
  ],
  cuttack: [
    { value: 'buxi_bazaar', label: 'Buxi Bazaar', risk: 'HIGH', baseAdj: 1.25 },
    { value: 'choudhary_bazar', label: 'Choudhary Bazar', risk: 'HIGH', baseAdj: 1.3 },
    { value: 'sikharpur', label: 'Sikharpur', risk: 'MEDIUM', baseAdj: 1.1 },
    { value: 'nayabazar', label: 'Nayabazar', risk: 'HIGH', baseAdj: 1.25 },
    { value: 'mahanadi_vihar', label: 'Mahanadi Vihar', risk: 'HIGH', baseAdj: 1.35 },
  ],
  madurai: [
    { value: 'town_hall', label: 'Town Hall', risk: 'LOW', baseAdj: 0.85 },
    { value: 'kk_nagar', label: 'KK Nagar', risk: 'LOW', baseAdj: 0.88 },
  ],
  tiruchirappalli: [
    { value: 'rockfort', label: 'Rockfort', risk: 'LOW', baseAdj: 0.85 },
    { value: 'thillai_nagar', label: 'Thillai Nagar', risk: 'LOW', baseAdj: 0.88 },
  ],
  mysore: [
    { value: 'devaraja_market', label: 'Devaraja Market', risk: 'LOW', baseAdj: 0.85 },
    { value: 'vijayanagar', label: 'Vijayanagar', risk: 'LOW', baseAdj: 0.88 },
  ],
  hubli: [
    { value: 'govidarb_nagar', label: 'Govidarb Nagar', risk: 'LOW', baseAdj: 0.85 },
    { value: 'deshpande_nagar', label: 'Deshpande Nagar', risk: 'LOW', baseAdj: 0.88 },
  ],
  belgaum: [
    { value: 'camp', label: 'Camp', risk: 'LOW', baseAdj: 0.85 },
    { value: 'vadgaon', label: 'Vadgaon', risk: 'LOW', baseAdj: 0.88 },
  ],
  aurangabad: [
    { value: 'cidco', label: 'CIDCO', risk: 'LOW', baseAdj: 0.85 },
    { value: 'osmanpura', label: 'Osmanpura', risk: 'LOW', baseAdj: 0.88 },
  ],
  nashik: [
    { value: 'mahalakshmi', label: 'Mahalakshmi', risk: 'LOW', baseAdj: 0.85 },
    { value: 'panchavati', label: 'Panchavati', risk: 'MEDIUM', baseAdj: 1.0 },
  ],
  kota: [
    { value: 'raneen_west', label: 'Raneen West', risk: 'LOW', baseAdj: 0.85 },
    { value: 'surgery', label: 'Surgery', risk: 'LOW', baseAdj: 0.88 },
  ],
  udaipur: [
    { value: 'fatehsagar', label: 'Fatehsagar', risk: 'LOW', baseAdj: 0.85 },
    { value: 'hiran_magri', label: 'Hiran Magri', risk: 'LOW', baseAdj: 0.88 },
  ],
  jodhpur: [
    { value: 'mi_basti', label: 'MI Basti', risk: 'LOW', baseAdj: 0.85 },
    { value: 'sardarpura', label: 'Sardarpura', risk: 'LOW', baseAdj: 0.88 },
  ],
  trivandrum: [
    { value: 'palayam', label: 'Palayam', risk: 'LOW', baseAdj: 0.85 },
    { value: 'kazhakoottam', label: 'Kazhakoottam', risk: 'MEDIUM', baseAdj: 1.0 },
  ],
  other: [
    { value: 'custom_zone', label: 'Custom Zone', risk: 'MEDIUM', baseAdj: 1.0 },
  ],
  current_location: [
    { value: 'gps_zone', label: 'GPS Detected Zone', risk: 'MEDIUM', baseAdj: 1.0 },
  ],
};

const RISK_COLORS = { HIGH: 'var(--orange)', MEDIUM: '#fbbf24', LOW: 'var(--green)' };

export const Register = () => {
  const navigate = useNavigate();
  const { state, updateState, showToast } = useApp();
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState({ aadhaar: false, selfie: false, bank: false });
  const [kycStatus, setKycStatus] = useState({ aadhaar: 'pending', mobile: 'pending', bank: 'pending', selfie: 'pending' });
  const [otpState, setOtpState] = useState({ sent: false, verified: false, resendTimer: 0 });
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: 'Rahul Patil',
    phone: '9876543210',
    email: 'rahul.patil@gmail.com',
    aadhaar: '',
    dob: '1996-03-15',
    platform: 'zomato',
    platformId: '',
    weeklyEarnings: 4500,
    workingHours: 8,
    city: 'mumbai',
    zone: 'andheri_west',
    upiId: 'rahulpatil@okicici',
    bankAccount: '',
    ifsc: '',
    latitude: null,
    longitude: null,
  });

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation not supported', 'error');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const mlResult = calculateRiskFromML(lat, lng);
        setCurrentLocation({
          lat,
          lng,
          accuracy: position.coords.accuracy,
          city: mlResult.city,
          risk: mlResult.risk,
          baseAdj: mlResult.baseAdj,
          floodDays: mlResult.floodDays,
          zoneName: mlResult.zoneName,
          zoneValue: mlResult.zoneValue
        });
        handleInputChange('city', mlResult.city);
        handleInputChange('zone', mlResult.zoneValue || 'custom_zone');
        setLocationLoading(false);
        showToast(`Location detected: ${mlResult.zoneName} (${mlResult.risk} Risk)`, 'success');
      },
      (error) => {
        setLocationLoading(false);
        showToast('Location error: ' + error.message, 'error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const detectCityFromCoords = (lat, lng) => {
    const cities = [
      { value: 'mumbai', lat: 19.076, lon: 72.8777, radius: 0.5 },
      { value: 'delhi', lat: 28.7041, lon: 77.1025, radius: 0.5 },
      { value: 'bengaluru', lat: 12.9716, lon: 77.5946, radius: 0.5 },
      { value: 'chennai', lat: 13.0827, lon: 80.2707, radius: 0.5 },
      { value: 'hyderabad', lat: 17.385, lon: 78.4867, radius: 0.5 },
      { value: 'kolkata', lat: 22.5726, lon: 88.3639, radius: 0.5 },
      { value: 'pune', lat: 18.5204, lon: 73.8567, radius: 0.5 },
      { value: 'ahmedabad', lat: 23.0225, lon: 72.5714, radius: 0.5 },
      { value: 'surat', lat: 21.1702, lon: 72.8311, radius: 0.5 },
      { value: 'jaipur', lat: 26.9124, lon: 75.7873, radius: 0.5 },
      { value: 'lucknow', lat: 26.8467, lon: 80.9462, radius: 0.5 },
      { value: 'chandigarh', lat: 30.7333, lon: 76.7794, radius: 0.5 },
      { value: 'indore', lat: 22.7196, lon: 75.8577, radius: 0.5 },
      { value: 'kochi', lat: 9.9312, lon: 76.2673, radius: 0.5 },
      { value: 'visakhapatnam', lat: 17.6868, lon: 83.2185, radius: 0.5 },
      { value: 'vadodara', lat: 22.2969, lon: 73.1726, radius: 0.5 },
      { value: 'nagpur', lat: 21.1458, lon: 79.0882, radius: 0.5 },
      { value: 'bhopal', lat: 23.2585, lon: 77.4016, radius: 0.5 },
      { value: 'patna', lat: 25.5941, lon: 85.1376, radius: 0.5 },
      { value: 'guwahati', lat: 26.1445, lon: 91.7362, radius: 0.5 },
      { value: 'dehradun', lat: 30.3165, lon: 78.0322, radius: 0.5 },
      { value: 'ludhiana', lat: 30.9009, lon: 75.8573, radius: 0.5 },
      { value: 'varanasi', lat: 25.3176, lon: 82.9739, radius: 0.5 },
      { value: 'ranchi', lat: 23.3441, lon: 85.3095, radius: 0.5 },
      { value: 'bhubaneswar', lat: 20.2961, lon: 85.8245, radius: 0.5 },
      { value: 'mangalore', lat: 12.9141, lon: 74.856, radius: 0.5 },
      { value: 'coimbatore', lat: 11.0168, lon: 76.9558, radius: 0.5 },
      { value: 'mysore', lat: 12.2958, lon: 76.6394, radius: 0.5 },
      { value: 'aurangabad', lat: 19.8762, lon: 75.3433, radius: 0.5 },
      { value: 'nashik', lat: 19.9975, lon: 73.7898, radius: 0.5 },
      { value: 'kota', lat: 25.2138, lon: 75.8648, radius: 0.5 },
      { value: 'udaipur', lat: 24.5854, lon: 73.7125, radius: 0.5 },
      { value: 'jodhpur', lat: 26.2389, lon: 73.0243, radius: 0.5 },
    ];

    for (const city of cities) {
      const distance = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lon, 2));
      if (distance <= city.radius) {
        return city.value;
      }
    }
    return 'other';
  };

  const fileInputRefs = { aadhaar: useRef(), selfie: useRef() };
  const [kycDocPreview, setKycDocPreview] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const zones = ZONES[formData.city] || ZONES.mumbai;
  const currentZone = zones.find(z => z.value === formData.zone) || zones[0];
  const cityTier = CITIES.find(c => c.value === formData.city)?.tier || 1;
  const dailyBaseline = Math.round(formData.weeklyEarnings / 6);

  const basePremium = cityTier === 1 ? 70 : cityTier === 2 ? 50 : 38;
  const zoneMultiplier = currentZone?.baseAdj || 1.0;
  const estimatedPremium = Math.round(basePremium * zoneMultiplier);

  useEffect(() => {
    updateState({
      dailyBaseline,
      weeklyEarnings: formData.weeklyEarnings,
      city: formData.city,
      zone: formData.zone,
      platform: formData.platform,
    });
  }, [formData.weeklyEarnings, formData.city, formData.zone, formData.platform, dailyBaseline, updateState]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'city' && ZONES[value]) {
      setFormData(prev => ({ ...prev, zone: ZONES[value][0]?.value || '' }));
    }
    if (field === 'city' && value === 'current_location') {
      getCurrentLocation();
    }
  };

  const simulateUpload = async (type) => {
    setUploading(prev => ({ ...prev, [type]: true }));
    await new Promise(r => setTimeout(r, 1500));
    setUploading(prev => ({ ...prev, [type]: false }));
    showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} document uploaded`, 'success');
  };

  const runKYC = async () => {
    const stages = [
      { delay: 500, update: { aadhaar: 'verifying' } },
      { delay: 1200, update: { aadhaar: 'verified' } },
      { delay: 1800, update: { selfie: 'verifying' } },
      { delay: 2500, update: { selfie: 'verified' } },
      { delay: 3000, update: { mobile: 'verifying' } },
      { delay: 3500, update: { mobile: 'verified' } },
      { delay: 4200, update: { bank: 'verifying' } },
      { delay: 4800, update: { bank: 'linked' }, complete: true },
    ];

    for (const stage of stages) {
      await new Promise(r => setTimeout(r, stage.delay - (stages.indexOf(stage) > 0 ? stages[stages.indexOf(stage) - 1].delay : 0)));
      setKycStatus(prev => ({ ...prev, ...stage.update }));
      if (stage.complete) {
        updateState({ kycDone: true });
        showToast('KYC verified successfully! All documents validated.', 'success');
      }
    }
  };

  const completeRegistration = async () => {
    try {
      await apiService.createWorkerProfile({
        platform: formData.platform,
        occupation: formData.platformId || 'Delivery',
        latitude: 0,
        longitude: 0,
        zone_id: formData.zone,
      });
    } catch (err) {
      console.log('Profile sync skipped:', err.message);
    }

    const workerId = `GIG-${formData.city.toUpperCase().slice(0, 3)}-2024-${Math.floor(Math.random() * 9000 + 1000)}`;
    updateState({
      workerId,
      workerName: formData.name,
      platform: formData.platform,
      platformId: formData.platformId,
      weeklyEarnings: formData.weeklyEarnings,
      dailyBaseline,
      phone: formData.phone,
      upiId: formData.upiId,
      kycDone: true,
      zone: formData.zone,
      city: formData.city,
    });
    setStep(5);
    showToast('Registration complete! Welcome to GigProtector.', 'success');
  };

  const getKycStatusBadge = (status) => {
    switch (status) {
      case 'verified': return <span className="badge badge-green">Verified</span>;
      case 'linked': return <span className="badge badge-green">Linked</span>;
      case 'verifying': return <span className="badge badge-yellow">Verifying...</span>;
      case 'sent': return <span className="badge badge-yellow">OTP Sent</span>;
      default: return <span className="badge badge-yellow">Pending</span>;
    }
  };

  const sendMobileOTP = async () => {
    setOtpState(prev => ({ ...prev, sent: true, resendTimer: 30 }));
    showToast('OTP sent to +91 ' + formData.phone, 'success');

    const interval = setInterval(() => {
      setOtpState(prev => {
        if (prev.resendTimer <= 1) {
          clearInterval(interval);
          return { ...prev, resendTimer: 0 };
        }
        return { ...prev, resendTimer: prev.resendTimer - 1 };
      });
    }, 1000);
  };

  const verifyMobileOTP = (otp) => {
    if (otp === '1234' || otp.length === 4) {
      setKycStatus(prev => ({ ...prev, mobile: 'verified' }));
      setOtpState(prev => ({ ...prev, verified: true }));
      showToast('Mobile verified!', 'success');
    } else {
      showToast('Invalid OTP', 'error');
    }
  };

  const startResendTimer = () => {
    setOtpState(prev => ({ ...prev, resendTimer: 30 }));
    const interval = setInterval(() => {
      setOtpState(prev => {
        if (prev.resendTimer <= 1) {
          clearInterval(interval);
          return { ...prev, resendTimer: 0 };
        }
        return { ...prev, resendTimer: prev.resendTimer - 1 };
      });
    }, 1000);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      showToast('Camera access denied or not available', 'error');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg');
      setKycDocPreview(imageData);
      setKycStatus(prev => ({ ...prev, selfie: 'verifying' }));
      stopCamera();
      showToast('Selfie captured! Verifying...', 'success');
      setTimeout(() => {
        setKycStatus(prev => ({ ...prev, selfie: 'verified' }));
        showToast('Selfie verified!', 'success');
      }, 1500);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const getStepClass = (stepNum) => {
    if (stepNum < step) return 'completed';
    if (stepNum === step) return 'active';
    return '';
  };

  const isStepComplete = (stepNum) => {
    switch (stepNum) {
      case 1: return kycStatus.aadhaar === 'verified' && kycStatus.selfie === 'verified' && otpState.verified && kycStatus.bank === 'linked';
      case 2: return formData.platform && formData.platformId && formData.weeklyEarnings > 0;
      case 3: return formData.city && formData.zone;
      case 4: return formData.upiId && formData.upiId.includes('@');
      default: return false;
    }
  };

  return (
    <div className="page">
      <div className="premium-hero">
        <div className="premium-hero-glow" />
        <div className="premium-hero-separator" />
        
        <div className="premium-hero-split">
          <div className="premium-hero-content">
            <div className="premium-badge">
              <span className="premium-badge-icon">✦</span>
              <span>Worker Onboarding</span>
            </div>
            
            <h1 className="premium-headline">
              Get <span className="premium-gradient">Protected</span> in 2 Minutes
            </h1>
            
            <p className="premium-subtitle">
              Complete registration with eKYC via DigiLocker. Zero paperwork required. 
              AI-powered verification for instant activation.
            </p>
            
            <div className="premium-trust">
              <div className="trust-item">
                <span>📱</span>
                <span>Mobile Verify</span>
              </div>
              <div className="trust-item">
                <span>🆔</span>
                <span>eKYC Ready</span>
              </div>
              <div className="trust-item">
                <span>⚡</span>
                <span>Instant Setup</span>
              </div>
            </div>
          </div>
          
          <div className="premium-card-wrapper">
            <div className="premium-glass-card">
              <div className="card-shimmer" />
              <div className="card-header-mini">
                <span className="card-icon-mini">📋</span>
                <span>Registration</span>
              </div>
              <div className="card-price-mini">
                <span className="price-amount">4</span>
                <span className="price-period">steps</span>
              </div>
              <div className="card-features-mini">
                <div className="feature-mini">
                  <span className="check-mini">✓</span>
                  <span>Phone verification</span>
                </div>
                <div className="feature-mini">
                  <span className="check-mini">✓</span>
                  <span>City & zone selection</span>
                </div>
                <div className="feature-mini">
                  <span className="check-mini">✓</span>
                  <span>Policy selection</span>
                </div>
                <div className="feature-mini">
                  <span className="check-mini">✓</span>
                  <span>UPI payment setup</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="register-steps">
        {STEPS.map((s) => (
          <div key={s.num} className={`register-step ${getStepClass(s.num)}`}>
            <div className="step-icon-wrapper">
              <span className="step-num-text">
                {s.num < step ? '✓' : s.num}
              </span>
            </div>
            <div className="step-label">{s.label}</div>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="grid-2">
          <div className="card">
            <h2>Personal Information</h2>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <div className="flex gap-8">
                <input type="tel" value="+91 " readOnly style={{ width: '50px' }} />
                <input type="tel" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} style={{ flex: 1 }} />
              </div>
            </div>
            <div className="form-group">
              <label>Email (Optional)</label>
              <input type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" value={formData.dob} onChange={e => handleInputChange('dob', e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={() => setStep(2)}>
              Continue to Platform Details →
            </button>
          </div>

          <div className="card">
            <h2>KYC Verification</h2>
            <div className="alert alert-info">
              <strong>🔐 eKYC via DigiLocker</strong><br />
              <span className="fs-12">Your Aadhaar data is verified in real-time. Data is never stored on our servers.</span>
            </div>

            <div className="kyc-item">
              <div className="kyc-item-header">
                <span className="kyc-icon">ID</span>
                <div>
                  <div className="fs-13 fw-600">Aadhaar Verification</div>
                  <div className="fs-12 c-text2">Upload Aadhaar front & back</div>
                </div>
                {getKycStatusBadge(kycStatus.aadhaar)}
              </div>
              {!fileInputRefs.aadhaar.current?.files?.length && kycStatus.aadhaar === 'pending' && (
                <button className="btn btn-outline btn-sm mt-8" onClick={() => simulateUpload('aadhaar')}>
                  {uploading.aadhaar ? <><span className="spinner" /> Uploading...</> : '📤 Upload Aadhaar'}
                </button>
              )}
            </div>

            <div className="kyc-item">
              <div className="kyc-item-header">
                <span className="kyc-icon">Selfie</span>
                <div>
                  <div className="fs-13 fw-600">Selfie Verification</div>
                  <div className="fs-12 c-text2">Face match with Aadhaar</div>
                </div>
                {getKycStatusBadge(kycStatus.selfie)}
              </div>
              
              {kycDocPreview && kycStatus.selfie !== 'pending' ? (
                <div className="bank-doc-preview">
                  <img src={kycDocPreview} alt="Selfie" className="doc-thumbnail" />
                  <div className="bank-doc-actions">
                    <button 
                      className="btn btn-sm btn-outline" 
                      onClick={() => { setKycDocPreview(null); setKycStatus(prev => ({ ...prev, selfie: 'pending' })); }}
                    >
                      ✕ Remove
                    </button>
                    <button 
                      className="btn btn-sm btn-teal" 
                      onClick={() => { setKycStatus(prev => ({ ...prev, selfie: 'verified' })); showToast('Selfie verified!'); }}
                      disabled={kycStatus.selfie === 'verified'}
                    >
                      {kycStatus.selfie === 'verifying' ? <><span className="spinner" /> Verifying...</> : '✓ Verify'}
                    </button>
                  </div>
                </div>
              ) : cameraActive ? (
                <div className="camera-container">
                  <video ref={videoRef} className="camera-preview" autoPlay playsInline />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  <div className="camera-controls">
                    <button className="btn btn-sm btn-outline" onClick={stopCamera}>Cancel</button>
                    <button className="btn btn-sm btn-primary" onClick={capturePhoto}>📸 Capture</button>
                  </div>
                </div>
              ) : kycStatus.selfie === 'pending' ? (
                <div className="bank-capture-options">
                  <button 
                    className="btn btn-outline btn-sm" 
                    onClick={startCamera}
                  >
                    📷 Open Camera
                  </button>
                </div>
              ) : null}
            </div>

            <div className="kyc-item">
              <div className="kyc-item-header">
                <span className="kyc-icon">OTP</span>
                <div>
                  <div className="fs-13 fw-600">Mobile OTP</div>
                  <div className="fs-12 c-text2">Verify ownership of +91 {formData.phone}</div>
                </div>
                {getKycStatusBadge(kycStatus.mobile)}
              </div>
              {!otpState.sent ? (
                <button className="btn btn-outline btn-sm mt-8" onClick={sendMobileOTP} disabled={!formData.phone || formData.phone.length < 10}>
                  📱 Send OTP
                </button>
              ) : !otpState.verified ? (
                <div style={{ marginTop: '8px' }}>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="Enter 4-digit OTP"
                    style={{ width: '150px', textAlign: 'center', letterSpacing: '4px', marginBottom: '8px' }}
                    onChange={(e) => {
                      if (e.target.value.length === 4) {
                        verifyMobileOTP(e.target.value);
                      }
                    }}
                  />
                  <div>
                    <button className="btn btn-sm btn-link" onClick={() => sendMobileOTP()} disabled={otpState.resendTimer > 0}>
                      {otpState.resendTimer > 0 ? `Resend in ${otpState.resendTimer}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="kyc-item">
              <div className="kyc-item-header">
                <span className="kyc-icon">Bank</span>
                <div>
                  <div className="fs-13 fw-600">Bank Account</div>
                  <div className="fs-12 c-text2">Link for UPI payouts</div>
                </div>
                {getKycStatusBadge(kycStatus.bank)}
              </div>
              {kycStatus.bank === 'pending' && (
                <button className="btn btn-outline btn-sm mt-8" onClick={() => {
                  setKycStatus(prev => ({ ...prev, bank: 'verifying' }));
                  setTimeout(() => {
                    setKycStatus(prev => ({ ...prev, bank: 'linked' }));
                    showToast('Bank account linked!', 'success');
                  }, 1500);
                }}>
                  🏦 Link Bank Account
                </button>
              )}
            </div>

            <button className="btn btn-green btn-full mt-16" onClick={runKYC} disabled={Object.values(kycStatus).some(s => s === 'verifying')}>
              {Object.values(kycStatus).some(s => s === 'verifying') ? (
                <><span className="spinner" /> Verifying with DigiLocker...</>
              ) : '🔒 Run Auto KYC'}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid-2">
          <div className="card">
            <h2>Platform & Earnings</h2>
            <div className="form-group">
              <label>Select Your Delivery Platform</label>
              <div className="platform-grid">
                {PLATFORMS.map(p => (
                  <div
                    key={p.value}
                    className={`platform-option ${formData.platform === p.value ? 'selected' : ''}`}
                    onClick={() => handleInputChange('platform', p.value)}
                    style={{ '--platform-color': p.color, '--platform-color-rgb': p.rgb }}
                  >
                    <span className="platform-logo">{p.logo}</span>
                    <span>{p.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Platform Worker ID</label>
              <input type="text" value={formData.platformId} onChange={e => handleInputChange('platformId', e.target.value)} placeholder="e.g., ZOM-MUM-284756" />
            </div>
            <div className="form-group">
              <label>Average Weekly Earnings (₹)</label>
              <input type="range" min="1500" max="12000" step="100" value={formData.weeklyEarnings} onChange={e => handleInputChange('weeklyEarnings', parseInt(e.target.value))} />
              <div className="flex justify-between fs-12 c-text2 mt-8">
                <span>₹1,500</span>
                <span className="fw-600 c-blue">₹{formData.weeklyEarnings.toLocaleString()}/week</span>
                <span>₹12,000</span>
              </div>
            </div>
            <div className="form-group">
              <label>Working Hours/Day</label>
              <select value={formData.workingHours} onChange={e => handleInputChange('workingHours', parseInt(e.target.value))}>
                <option value={4}>Part-time (4 hrs)</option>
                <option value={6}>6 hours/day</option>
                <option value={8}>Full-time (8 hrs)</option>
                <option value={10}>Extended (10 hrs)</option>
                <option value={12}>Maximum (12 hrs)</option>
              </select>
            </div>
            <div className="flex gap-8">
              <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>Next: Zone Setup →</button>
            </div>
          </div>

          <div className="card">
            <h2>Earnings Analysis</h2>
            <div className="premium-meter">
              <div className="label">Estimated Daily Baseline</div>
              <div className="premium-amount">₹{dailyBaseline}</div>
              <div className="premium-per">based on ₹{formData.weeklyEarnings}/week</div>
            </div>
            <div className="mt-16">
              <div className="risk-factor">
                <span className="fs-13 c-text2">Platform</span>
                <span className="fs-13 fw-600">{PLATFORMS.find(p => p.value === formData.platform)?.label}</span>
              </div>
              <div className="risk-factor">
                <span className="fs-13 c-text2">8-week earning average</span>
                <span className="fs-13 fw-600 c-blue">₹{formData.weeklyEarnings}/week</span>
              </div>
              <div className="risk-factor">
                <span className="fs-13 c-text2">Income volatility</span>
                <span className="badge badge-green">Low (0.12)</span>
              </div>
              <div className="risk-factor">
                <span className="fs-13 c-text2">Platform tenure</span>
                <span className="fs-13 fw-600">14 months (simulated)</span>
              </div>
              <div className="risk-factor">
                <span className="fs-13 c-text2">Consistency score</span>
                <span className="badge badge-teal">91/100</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid-2">
          <div className="card">
            <h2>Delivery Zone</h2>
            <div className="form-group">
              <label>City</label>
              <select value={formData.city} onChange={e => handleInputChange('city', e.target.value)}>
                {CITIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}{c.tier === 1 ? ' (Tier 1)' : c.tier === 2 ? ' (Tier 2)' : c.tier === 3 ? ' (Tier 3)' : ''}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Primary Delivery Zone</label>
              <div style={{ marginBottom: '12px' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {locationLoading ? '📍 Getting location...' : '📍 Get Current Location'}
                </button>
                {currentLocation && (
                  <div style={{ fontSize: '12px', color: '#10b981', marginTop: '6px' }}>
                    ✓ Location captured: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                    (Accuracy: ±{Math.round(currentLocation.accuracy)}m)
                  </div>
                )}
              </div>
              {currentLocation && currentLocation.zoneName ? (() => {
                const matchedZone = ZONES[formData.city]?.find(z => z.value === currentLocation.zoneValue || z.label === currentLocation.zoneName) || currentZone;
                const baseAdj = matchedZone.baseAdj || currentLocation.baseAdj || 1.0;
                const risk = matchedZone.risk || currentLocation.risk || 'MEDIUM';
                return (
                  <div className="zone-result-card">
                    <div className="zone-result-header">
                      <span className="zone-result-icon">📍</span>
                      <span className="zone-result-name">{currentLocation.zoneName}</span>
                    </div>
                    <div className="zone-result-details">
                      <span className={`badge ${risk === 'EXTREME' || risk === 'HIGH' ? 'badge-orange' :
                          risk === 'MEDIUM' ? 'badge-yellow' : 'badge-green'
                        }`}>
                        {risk} RISK
                      </span>
                      <span className="zone-result-premium">
                        {baseAdj < 1 ? `-₹${Math.round(basePremium * (1 - baseAdj))}` :
                          baseAdj > 1 ? `+₹${Math.round(basePremium * (baseAdj - 1))}` : 'Base'}
                      </span>
                    </div>
                  </div>
                );
              })() : (
                <div className="alert alert-warning">
                  Search location or use current location in the map to calculate your zone risk
                </div>
              )}
            </div>
            <div className="flex gap-8">
              <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn-primary" onClick={() => setStep(4)}>Next: Payment Setup →</button>
            </div>
          </div>

          <div className="card">
            <h2>Zone Risk Assessment</h2>
            <div className="alert alert-info mb-16">
              <strong>ML-Powered Risk Analysis</strong><br />
              <span className="fs-12">Search or use current location to calculate your zone risk automatically.</span>
            </div>
            <ZoneMap
              city={formData.city}
              initialCenter={currentLocation ? [currentLocation.lat, currentLocation.lng] : null}
              initialZoom={15}
              onLocationSelect={(location) => {
                if (location) {
                  setCurrentLocation({
                    lat: location.lat,
                    lng: location.lng,
                    accuracy: location.accuracy || 100,
                    city: location.city,
                    risk: location.risk,
                    baseAdj: location.baseAdj,
                    floodDays: location.floodDays,
                    zoneName: location.zoneName,
                    zoneValue: location.zoneValue
                  });
                  handleInputChange('city', location.city);
                  handleInputChange('zone', location.zoneValue || 'custom_zone');
                }
              }}
              height="350px"
            />
            <div className="mt-16">
              <div className="risk-factor">
                <span className="fs-13 c-text2">ML Risk Assessment</span>
                <span className={`badge ${currentLocation?.risk === 'EXTREME' || currentLocation?.risk === 'HIGH' ? 'badge-orange' : currentLocation?.risk === 'MEDIUM' ? 'badge-yellow' : 'badge-green'}`}>
                  {currentLocation?.risk || currentZone.risk || 'MEDIUM'} — {(ZONES[formData.city]?.find(z => z.value === currentLocation?.zoneValue)?.baseAdj || currentLocation?.baseAdj || currentZone.baseAdj || 1.0).toFixed(2)}x premium
                </span>
              </div>
              <div className="risk-factor">
                <span className="fs-13 c-text2">Flood Days/Year (ML Prediction)</span>
                <span className="fs-13 fw-600">
                  {currentLocation?.floodDays || currentZone.baseAdj > 1.2 ? '8-12 days' : currentZone.baseAdj > 1.0 ? '4-8 days' : '2-4 days'}
                </span>
              </div>
              <div className="risk-factor">
                <span className="fs-13 c-text2">Zone Name</span>
                <span className="fs-13 fw-600">{currentLocation?.zoneName || currentZone.label}</span>
              </div>
              <div className="risk-factor">
                <span className="fs-13 c-text2">Estimated Premium</span>
                <span className="fs-13 fw-600 c-blue">₹{estimatedPremium}/week</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="grid-2">
          <div className="card">
            <h2>UPI Payout Setup</h2>
            <div className="alert alert-success">
              <strong>💰 Fast Payouts</strong><br />
              <span className="fs-12">Claims are credited to your UPI within 2-4 hours of trigger detection. No bank delays.</span>
            </div>
            <div className="form-group">
              <label>UPI ID for Payouts</label>
              <input type="text" value={formData.upiId} onChange={e => handleInputChange('upiId', e.target.value)} placeholder="yourname@okicici" />
            </div>
            <div className="form-group">
              <label>Or Bank Account Number</label>
              <input type="text" value={formData.bankAccount} onChange={e => handleInputChange('bankAccount', e.target.value)} placeholder="Account number" />
            </div>
            <div className="form-group">
              <label>IFSC Code</label>
              <input type="text" value={formData.ifsc} onChange={e => handleInputChange('ifsc', e.target.value)} placeholder="SBIN0001234" />
            </div>
            <div className="flex gap-8">
              <button className="btn btn-outline" onClick={() => setStep(3)}>← Back</button>
              <button className="btn btn-primary" onClick={completeRegistration}>Complete Registration →</button>
            </div>
          </div>

          <div className="card">
            <h2>Policy Preview</h2>
            <div className="premium-meter mb-16">
              <div className="label">Estimated Weekly Premium</div>
              <div className="premium-amount">₹{estimatedPremium}</div>
              <div className="premium-per">Standard Shield (75% coverage)</div>
            </div>
            <div className="risk-factor">
              <span className="fs-13 c-text2">City</span>
              <span className="fs-13 fw-600">{CITIES.find(c => c.value === formData.city)?.label}</span>
            </div>
            <div className="risk-factor">
              <span className="fs-13 c-text2">Zone</span>
              <span className="fs-13 fw-600">{currentZone.label}</span>
            </div>
            <div className="risk-factor">
              <span className="fs-13 c-text2">Daily Baseline</span>
              <span className="fs-13 fw-600 c-blue">₹{dailyBaseline}</span>
            </div>
            <div className="risk-factor">
              <span className="fs-13 c-text2">Max Weekly Payout</span>
              <span className="fs-13 fw-600 c-green">₹{Math.round(dailyBaseline * 0.75 * 7)}</span>
            </div>
            <div className="alert alert-info mt-16">
              Premium will be auto-debited weekly via UPI AutoPay on Mondays.
            </div>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="card text-center" style={{ padding: '48px 32px' }}>
          <div className="success-animation">✓</div>
          <h2 style={{ fontSize: '28px', color: 'var(--green-l)', marginTop: '16px' }}>Registration Complete!</h2>
          <p className="c-text2 fs-13" style={{ margin: '8px 0 24px' }}>
            Worker ID: <strong className="c-blue">{state.workerId}</strong>
          </p>
          <div className="grid-3" style={{ maxWidth: '500px', margin: '0 auto 24px' }}>
            <div>
              <div className="label">Weekly Premium</div>
              <div className="value c-blue">₹{estimatedPremium}</div>
            </div>
            <div>
              <div className="label">Daily Baseline</div>
              <div className="value">₹{dailyBaseline}</div>
            </div>
            <div>
              <div className="label">Coverage</div>
              <div className="value" style={{ color: 'var(--teal-l)' }}>75%</div>
            </div>
          </div>
          <div className="flex gap-8 justify-center">
            <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
            <button className="btn btn-primary" onClick={() => navigate('/policy')}>Set Up Policy →</button>
          </div>
        </div>
      )}
    </div>
  );
};
