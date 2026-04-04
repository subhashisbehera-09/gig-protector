import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/common_widgets.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController(text: 'Rahul Patil');
  final _phoneController = TextEditingController(text: '+91 98765 43210');
  final _aadhaarController = TextEditingController(text: '1234');
  final _platformIdController = TextEditingController(text: 'ZOM-MUM-284756');
  final _upiController = TextEditingController(text: 'rahulpatil@okicici');
  
  String _selectedPlatform = 'zomato';
  String _selectedCity = 'mumbai';
  String _selectedZone = 'andheri';
  int _weeklyEarnings = 4500;
  int _workingHours = 8;
  DateTime _dob = DateTime(1996, 3, 15);
  bool _kycLoading = false;
  Map<String, String> _kycStatus = {'aadhaar': 'pending', 'mobile': 'pending', 'bank': 'pending'};

  final List<Map<String, String>> _platforms = [
    {'value': 'zomato', 'label': 'Zomato', 'icon': '🍕'},
    {'value': 'swiggy', 'label': 'Swiggy', 'icon': '🧡'},
    {'value': 'zepto', 'label': 'Zepto', 'icon': '⚡'},
    {'value': 'amazon', 'label': 'Amazon Flex', 'icon': '📦'},
    {'value': 'dunzo', 'label': 'Dunzo', 'icon': '🏃'},
  ];

  final List<Map<String, String>> _cities = [
    {'value': 'mumbai', 'label': 'Mumbai'},
    {'value': 'delhi', 'label': 'Delhi NCR'},
    {'value': 'bengaluru', 'label': 'Bengaluru'},
    {'value': 'chennai', 'label': 'Chennai'},
    {'value': 'hyderabad', 'label': 'Hyderabad'},
  ];

  final List<Map<String, dynamic>> _zones = [
    {'value': 'andheri', 'label': 'Andheri West (High flood risk)', 'risk': 'HIGH'},
    {'value': 'kurla', 'label': 'Kurla (High flood risk)', 'risk': 'HIGH'},
    {'value': 'bandra', 'label': 'Bandra (Medium risk)', 'risk': 'MEDIUM'},
    {'value': 'dadar', 'label': 'Dadar (Medium risk)', 'risk': 'MEDIUM'},
    {'value': 'colaba', 'label': 'Colaba (Low risk)', 'risk': 'LOW'},
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _aadhaarController.dispose();
    _platformIdController.dispose();
    _upiController.dispose();
    super.dispose();
  }

  Color _getZoneRiskColor(String risk) {
    switch (risk) {
      case 'HIGH':
        return AppTheme.orange;
      case 'MEDIUM':
        return AppTheme.yellow;
      case 'LOW':
        return AppTheme.green;
      default:
        return AppTheme.orange;
    }
  }

  Future<void> _runKYC() async {
    setState(() => _kycLoading = true);

    await Future.delayed(const Duration(milliseconds: 800));
    setState(() => _kycStatus = {..._kycStatus, 'aadhaar': 'verified'});

    await Future.delayed(const Duration(milliseconds: 800));
    setState(() => _kycStatus = {..._kycStatus, 'mobile': 'verified'});

    await Future.delayed(const Duration(milliseconds: 800));
    setState(() {
      _kycStatus = {..._kycStatus, 'bank': 'linked'};
      _kycLoading = false;
    });

    if (mounted) {
      context.read<AppState>().setKycDone(true);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('KYC verified successfully!'), backgroundColor: AppTheme.green),
      );
    }
  }

  int _calculatePremium() {
    final cityBase = {'mumbai': 70, 'delhi': 70, 'bengaluru': 70, 'chennai': 50, 'hyderabad': 50};
    final base = cityBase[_selectedCity] ?? 70;
    final currentZone = _zones.firstWhere((z) => z['value'] == _selectedZone);
    final zoneMultiplier = currentZone['risk'] == 'HIGH' ? 1.3 : currentZone['risk'] == 'MEDIUM' ? 1.0 : 0.8;
    return (base * zoneMultiplier * (1 - 0.05)).round();
  }

  int get _dailyBaseline => (_weeklyEarnings / 6).round();

  @override
  Widget build(BuildContext context) {
    final appState = context.watch<AppState>();
    final step = appState.regStep;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [AppTheme.blueLight, AppTheme.tealLight]),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.shield, size: 18, color: Colors.white),
            ),
            const SizedBox(width: 8),
            const Text('gig-protector'),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            HeroSection(
              tags: [TagChip.auto('STEP ${step} OF 4')],
              title: 'Worker Registration',
              subtitle: 'Onboard in under 2 minutes. KYC via Aadhaar. Zero paperwork.',
            ),
            const SizedBox(height: 16),
            _buildStepIndicator(step),
            const SizedBox(height: 20),
            if (step == 1) _buildStep1(appState),
            if (step == 2) _buildStep2(),
            if (step == 3) _buildStep3(),
            if (step == 4) _buildStep4(),
          ],
        ),
      ),
    );
  }

  Widget _buildStepIndicator(int currentStep) {
    final steps = ['Identity', 'Platform', 'Zone', 'Complete'];
    return Row(
      children: List.generate(4, (index) {
        final stepNum = index + 1;
        final isActive = stepNum == currentStep;
        final isDone = stepNum < currentStep;
        return Expanded(
          child: GestureDetector(
            onTap: () {
              if (isDone) context.read<AppState>().setRegStep(stepNum);
            },
            child: Column(
              children: [
                Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    color: isDone ? AppTheme.green : (isActive ? AppTheme.blue : AppTheme.bg3),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isDone ? AppTheme.green : (isActive ? AppTheme.blue : AppTheme.border),
                      width: 2,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      '$stepNum',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: (isDone || isActive) ? Colors.white : AppTheme.text3,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  steps[index],
                  style: TextStyle(
                    fontSize: 10,
                    color: isActive ? AppTheme.blueLight : (isDone ? AppTheme.greenLight : AppTheme.text3),
                    fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                  ),
                ),
                if (index < 3) const SizedBox(height: 16),
              ],
            ),
          ),
        );
      }),
    );
  }

  Widget _buildStep1(AppState appState) {
    return Column(
      children: [
        _buildCard(
          title: 'Personal Details',
          children: [
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Full Name'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _phoneController,
              decoration: const InputDecoration(labelText: 'Mobile Number'),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _aadhaarController,
              decoration: const InputDecoration(labelText: 'Aadhaar (last 4 digits)'),
              maxLength: 12,
            ),
            const SizedBox(height: 12),
            _buildDatePicker(),
          ],
        ),
        const SizedBox(height: 16),
        _buildCard(
          title: 'KYC Verification',
          children: [
            AlertBox.info('eKYC via DigiLocker - your Aadhaar data is verified in real-time.'),
            const SizedBox(height: 16),
            _buildKycItem('Aadhaar Verification', _kycStatus['aadhaar']!),
            _buildKycItem('Mobile OTP', _kycStatus['mobile']!),
            _buildKycItem('Bank Account Link', _kycStatus['bank']!),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _kycLoading || appState.kycDone ? null : _runKYC,
              icon: _kycLoading
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.lock),
              label: Text(_kycLoading ? 'Verifying...' : 'Verify via DigiLocker'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.teal,
                minimumSize: const Size(double.infinity, 48),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: appState.kycDone ? () => appState.setRegStep(2) : null,
            child: const Text('Next: Platform Details'),
          ),
        ),
      ],
    );
  }

  Widget _buildStep2() {
    return Column(
      children: [
        _buildCard(
          title: 'Platform & Earnings',
          children: [
            DropdownButtonFormField<String>(
              value: _selectedPlatform,
              decoration: const InputDecoration(labelText: 'Primary Platform'),
              items: _platforms.map((p) => DropdownMenuItem(
                value: p['value'],
                child: Text('${p['icon']} ${p['label']}'),
              )).toList(),
              onChanged: (v) => setState(() => _selectedPlatform = v!),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _platformIdController,
              decoration: const InputDecoration(labelText: 'Platform Worker ID'),
            ),
            const SizedBox(height: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Average Weekly Earnings: ₹$_weeklyEarnings'),
                Slider(
                  value: _weeklyEarnings.toDouble(),
                  min: 1500,
                  max: 9000,
                  divisions: 75,
                  onChanged: (v) => setState(() => _weeklyEarnings = v.round()),
                ),
              ],
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<int>(
              value: _workingHours,
              decoration: const InputDecoration(labelText: 'Working Hours/Day'),
              items: const [
                DropdownMenuItem(value: 4, child: Text('4 hours (Part-time)')),
                DropdownMenuItem(value: 8, child: Text('8 hours (Full-time)')),
                DropdownMenuItem(value: 12, child: Text('12 hours (Extended)')),
              ],
              onChanged: (v) => setState(() => _workingHours = v!),
            ),
          ],
        ),
        const SizedBox(height: 16),
        _buildCard(
          title: 'Earnings Analysis',
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.bg3,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  const Text('Estimated Daily Baseline', style: TextStyle(fontSize: 11, color: AppTheme.text3, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  Text('₹$_dailyBaseline', style: const TextStyle(fontFamily: 'Outfit', fontSize: 32, fontWeight: FontWeight.w800, color: AppTheme.blueLight)),
                  const Text('based on ₹$_weeklyEarnings/week / 6 days', style: TextStyle(fontSize: 12, color: AppTheme.text2)),
                ],
              ),
            ),
            const SizedBox(height: 12),
            _buildRiskFactor('8-week earning average', '₹$_weeklyEarnings/week'),
            _buildRiskFactor('Income volatility score', 'Low (0.12)', badge: Badge.green('Low')),
            _buildRiskFactor('Platform tenure', '14 months'),
            _buildRiskFactor('Consistency score', '91/100', badge: Badge.teal('91/100')),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => context.read<AppState>().setRegStep(1),
                child: const Text('Back'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton(
                onPressed: () => context.read<AppState>().setRegStep(3),
                child: const Text('Next: Zone'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStep3() {
    final currentZone = _zones.firstWhere((z) => z['value'] == _selectedZone);
    final riskColor = _getZoneRiskColor(currentZone['risk'] as String);

    return Column(
      children: [
        _buildCard(
          title: 'Delivery Zone',
          children: [
            DropdownButtonFormField<String>(
              value: _selectedCity,
              decoration: const InputDecoration(labelText: 'City'),
              items: _cities.map((c) => DropdownMenuItem(
                value: c['value'],
                child: Text(c['label']!),
              )).toList(),
              onChanged: (v) => setState(() => _selectedCity = v!),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _selectedZone,
              decoration: const InputDecoration(labelText: 'Primary Zone'),
              items: _zones.map((z) => DropdownMenuItem(
                value: z['value'] as String,
                child: Text(z['label'] as String),
              )).toList(),
              onChanged: (v) => setState(() => _selectedZone = v!),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _upiController,
              decoration: const InputDecoration(labelText: 'UPI ID for Payouts'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        _buildCard(
          title: 'Zone Risk Assessment',
          children: [
            Container(
              height: 120,
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFF0D1B2A), Color(0xFF1A2F45)]),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.border),
              ),
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: riskColor.withOpacity(0.6),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '${currentZone['label']} - ${currentZone['risk']} RISK',
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            _buildRiskFactor('Flood Risk', currentZone['risk'] as String, badge: Badge(
              text: '${currentZone['risk']} ${currentZone['risk'] == 'HIGH' ? '1.3x' : currentZone['risk'] == 'MEDIUM' ? '1.0x' : '0.8x'}',
              backgroundColor: riskColor.withOpacity(0.15),
              textColor: riskColor,
            )),
            _buildRiskFactor('Avg Disruption Days/Year', currentZone['risk'] == 'HIGH' ? '18 days' : currentZone['risk'] == 'MEDIUM' ? '12 days' : '4 days'),
            _buildRiskFactor('Pollution Risk', 'LOW', badge: Badge.green('LOW')),
            _buildRiskFactor('Heat Risk', 'LOW', badge: Badge.green('LOW')),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => context.read<AppState>().setRegStep(2),
                child: const Text('Back'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton(
                onPressed: () {
                  final appState = context.read<AppState>();
                  appState.completeRegistration({
                    'workerId': 'GIG-MUM-2024-7842',
                    'platform': _selectedPlatform,
                    'platformId': _platformIdController.text,
                    'weeklyEarnings': _weeklyEarnings,
                    'dailyBaseline': _dailyBaseline,
                    'workerName': _nameController.text,
                    'phone': _phoneController.text,
                    'upiId': _upiController.text,
                  });
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Registration complete!'), backgroundColor: AppTheme.green),
                  );
                },
                child: const Text('Complete Registration'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStep4() {
    return _buildCard(
      title: '',
      children: [
        const Icon(Icons.check_circle, size: 64, color: AppTheme.greenLight),
        const SizedBox(height: 16),
        const Text('Registration Complete!', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.greenLight)),
        const SizedBox(height: 8),
        Text('Worker ID: ${context.read<AppState>().workerId}', style: const TextStyle(color: AppTheme.text2)),
        const SizedBox(height: 24),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildSummaryItem('Weekly Premium', '₹${_calculatePremium()}'),
            _buildSummaryItem('Daily Baseline', '₹$_dailyBaseline'),
            _buildSummaryItem('Coverage', '75%'),
          ],
        ),
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => context.read<AppState>().setCurrentPage(1),
            child: const Text('Set Up Insurance Policy'),
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryItem(String label, String value) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: AppTheme.text3, fontWeight: FontWeight.w600)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontFamily: 'Outfit', fontSize: 20, fontWeight: FontWeight.w700)),
      ],
    );
  }

  Widget _buildCard({required String title, required List<Widget> children}) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (title.isNotEmpty) ...[
            Text(title, style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 16),
          ],
          ...children,
        ],
      ),
    );
  }

  Widget _buildDatePicker() {
    return InkWell(
      onTap: () async {
        final date = await showDatePicker(
          context: context,
          initialDate: _dob,
          firstDate: DateTime(1950),
          lastDate: DateTime.now(),
        );
        if (date != null) setState(() => _dob = date);
      },
      child: InputDecorator(
        decoration: const InputDecoration(labelText: 'Date of Birth'),
        child: Text('${_dob.day}/${_dob.month}/${_dob.year}'),
      ),
    );
  }

  Widget _buildKycItem(String label, String status) {
    final isVerified = status == 'verified' || status == 'linked';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isVerified ? AppTheme.green : AppTheme.text3,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(child: Text(label, style: const TextStyle(fontSize: 13))),
          Badge(
            text: isVerified ? '$status ✓' : 'Pending',
            backgroundColor: isVerified ? AppTheme.green.withOpacity(0.15) : AppTheme.yellow.withOpacity(0.15),
            textColor: isVerified ? AppTheme.greenLight : AppTheme.yellow,
          ),
        ],
      ),
    );
  }

  Widget _buildRiskFactor(String label, String value, {Widget? badge}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: AppTheme.text2)),
          badge ?? Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
