import 'package:flutter/material.dart';

class AppState extends ChangeNotifier {
  int _currentPage = 0;
  int _regStep = 1;
  bool _kycDone = false;
  String _selectedTier = 'standard';
  String _workerName = 'Rahul Patil';
  int _weeklyEarnings = 4500;
  int _dailyBaseline = 750;
  String _zone = 'andheri';
  String _city = 'mumbai';
  int _alertCount = 0;
  String _workerId = 'GIG-MUM-2024-7842';
  String _platform = 'zomato';
  String _platformId = 'ZOM-MUM-284756';
  String _phone = '+91 98765 43210';
  String _upiId = 'rahulpatil@okicici';
  int _tenure = 14;
  double _loyaltyDiscount = 0.05;
  int _consistencyScore = 91;

  int get currentPage => _currentPage;
  int get regStep => _regStep;
  bool get kycDone => _kycDone;
  String get selectedTier => _selectedTier;
  String get workerName => _workerName;
  int get weeklyEarnings => _weeklyEarnings;
  int get dailyBaseline => _dailyBaseline;
  String get zone => _zone;
  String get city => _city;
  int get alertCount => _alertCount;
  String get workerId => _workerId;
  String get platform => _platform;
  String get platformId => _platformId;
  String get phone => _phone;
  String get upiId => _upiId;
  int get tenure => _tenure;
  double get loyaltyDiscount => _loyaltyDiscount;
  int get consistencyScore => _consistencyScore;

  void setCurrentPage(int page) {
    _currentPage = page;
    notifyListeners();
  }

  void setRegStep(int step) {
    _regStep = step;
    notifyListeners();
  }

  void setKycDone(bool done) {
    _kycDone = done;
    notifyListeners();
  }

  void setSelectedTier(String tier) {
    _selectedTier = tier;
    notifyListeners();
  }

  void setWorkerName(String name) {
    _workerName = name;
    notifyListeners();
  }

  void setWeeklyEarnings(int earnings) {
    _weeklyEarnings = earnings;
    _dailyBaseline = (earnings / 6).round();
    notifyListeners();
  }

  void setZone(String zone) {
    _zone = zone;
    notifyListeners();
  }

  void setCity(String city) {
    _city = city;
    notifyListeners();
  }

  void setAlertCount(int count) {
    _alertCount = count;
    notifyListeners();
  }

  void setPlatform(String platform) {
    _platform = platform;
    notifyListeners();
  }

  void setPlatformId(String id) {
    _platformId = id;
    notifyListeners();
  }

  void setPhone(String phone) {
    _phone = phone;
    notifyListeners();
  }

  void setUpiId(String upiId) {
    _upiId = upiId;
    notifyListeners();
  }

  void setWorkerId(String id) {
    _workerId = id;
    notifyListeners();
  }

  void setTenure(int tenure) {
    _tenure = tenure;
    notifyListeners();
  }

  void setLoyaltyDiscount(double discount) {
    _loyaltyDiscount = discount;
    notifyListeners();
  }

  void setConsistencyScore(int score) {
    _consistencyScore = score;
    notifyListeners();
  }

  void completeRegistration(Map<String, dynamic> data) {
    _workerId = data['workerId'] ?? _workerId;
    _platform = data['platform'] ?? _platform;
    _platformId = data['platformId'] ?? _platformId;
    _weeklyEarnings = data['weeklyEarnings'] ?? _weeklyEarnings;
    _dailyBaseline = data['dailyBaseline'] ?? _dailyBaseline;
    _workerName = data['workerName'] ?? _workerName;
    _phone = data['phone'] ?? _phone;
    _upiId = data['upiId'] ?? _upiId;
    _regStep = 4;
    notifyListeners();
  }
}
