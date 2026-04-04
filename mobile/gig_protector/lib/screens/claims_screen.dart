import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/common_widgets.dart';

class ClaimsScreen extends StatefulWidget {
  const ClaimsScreen({super.key});

  @override
  State<ClaimsScreen> createState() => _ClaimsScreenState();
}

class _ClaimsScreenState extends State<ClaimsScreen> {
  String _claimTrigger = 'rain';
  int _claimDays = 3;
  String _claimScenario = 'genuine';
  bool _processing = false;
  List<Map<String, dynamic>> _claimLogs = [];
  int? _payout;

  final _triggerOptions = [
    {'value': 'rain', 'label': '🌧️ Heavy Rainfall - IMD Red Alert (Mumbai)'},
    {'value': 'aqi', 'label': '😷 Severe AQI 456 + GRAP Stage IV (Delhi)'},
    {'value': 'bandh', 'label': '🚫 Unplanned Bandh - Zone Closure (Bengaluru)'},
    {'value': 'heat', 'label': '🌡️ Extreme Heat 46°C (Hyderabad)'},
    {'value': 'fog', 'label': '🌫️ Dense Fog - Visibility 120m (Delhi)'},
  ];

  final _dayOptions = [1, 2, 3, 4, 5];

  final _scenarioOptions = [
    {'value': 'genuine', 'label': '✅ Genuine worker - stranded in zone'},
    {'value': 'amber', 'label': '🟡 Amber case - degraded network data'},
    {'value': 'fraud', 'label': '🔴 Fraud attempt - GPS spoofed location'},
  ];

  final _claimHistory = [
    {'id': 'CLM-0041', 'trigger': 'Heavy Rain - IMD Red Alert', 'days': 3, 'payout': 1575, 'date': 'Mar 15, 2024', 'status': 'paid', 'score': 18},
    {'id': 'CLM-0038', 'trigger': 'Dense Fog - Visibility 80m', 'days': 1, 'payout': 525, 'date': 'Feb 28, 2024', 'status': 'paid', 'score': 12},
    {'id': 'CLM-0035', 'trigger': 'Unplanned Bandh - Zone Closure', 'days': 2, 'payout': 1050, 'date': 'Feb 10, 2024', 'status': 'paid', 'score': 22},
    {'id': 'CLM-0031', 'trigger': 'Extreme Heat 45°C', 'days': 2, 'payout': 1050, 'date': 'May 22, 2023', 'status': 'paid', 'score': 31},
    {'id': 'CLM-0028', 'trigger': 'Heavy Rain - IMD Red Alert', 'days': 4, 'payout': 2100, 'date': 'Jul 4, 2023', 'status': 'paid', 'score': 44},
    {'id': 'CLM-0022', 'trigger': 'Severe AQI - GRAP IV', 'days': 3, 'payout': 1575, 'date': 'Nov 3, 2023', 'status': 'paid', 'score': 19},
  ];

  final _triggerNames = {
    'rain': 'Heavy Rainfall - IMD Red Alert (68mm)',
    'aqi': 'Severe AQI 456 + GRAP Stage IV',
    'bandh': 'Unplanned Bandh - Zone Closure',
    'heat': 'Extreme Heat 46°C',
    'fog': 'Dense Fog - Visibility 120m',
  };

  Future<void> _processClaim() async {
    final appState = context.read<AppState>();
    setState(() {
      _processing = true;
      _claimLogs = [];
      _payout = null;
    });

    final coveragePct = _claimScenario == 'basic' ? 0.6 : (_claimScenario == 'premium' ? 0.9 : 0.75);
    final coveragePctFinal = _claimScenario == 'genuine' ? 0.75 : (_claimScenario == 'amber' ? 0.75 : 0.0);
    final calculatedPayout = (appState.dailyBaseline * coveragePctFinal * _claimDays).round();

    final steps = [
      {'delay': 400, 'icon': '📡', 'text': 'Checking ${_triggerNames[_claimTrigger]}...', 'status': 'checking'},
      {'delay': 900, 'icon': '✅', 'text': 'Trigger confirmed. Confidence score: 87/100', 'status': 'ok'},
      {'delay': 1400, 'icon': '📍', 'text': 'Validating worker location - GPS ping in Andheri West zone...', 'status': 'checking'},
      {'delay': 1900, 'icon': _claimScenario == 'fraud' ? '🚨' : '✅', 'text': _claimScenario == 'fraud' ? 'GPS SPOOF DETECTED! GPS reports Andheri but cell towers resolve to Thane (18km delta).' : 'Location confirmed. Cell tower delta: 0.8km ✓', 'status': _claimScenario == 'fraud' ? 'fraud' : 'ok'},
      {'delay': 2400, 'icon': '📊', 'text': _claimScenario == 'fraud' ? 'Anomaly: earnings on Swiggy during claimed loss' : 'Checking platform activity - App open, 0 trips in 4hrs ✓', 'status': _claimScenario == 'fraud' ? 'fraud' : 'ok'},
      {'delay': 2900, 'icon': '🤖', 'text': 'Running Isolation Forest fraud model (18 features)...', 'status': 'checking'},
      {'delay': 3500, 'icon': _claimScenario == 'genuine' ? '🟢' : (_claimScenario == 'amber' ? '🟡' : '🔴'), 'text': _claimScenario == 'genuine' ? 'Fraud score: 16/100 → GREEN PATH - Auto-approve' : (_claimScenario == 'amber' ? 'Fraud score: 52/100 → AMBER PATH - Weather Network Discount applied' : 'Fraud score: 84/100 → RED PATH - GPS spoof confirmed. Claim DENIED.'), 'status': _claimScenario == 'genuine' ? 'ok' : (_claimScenario == 'amber' ? 'warn' : 'fraud')},
    ];

    if (_claimScenario == 'amber') {
      steps.add({'delay': 4500, 'icon': '✅', 'text': 'Zone-level peer validation: 14/17 workers in zone show same pattern. AUTO-APPROVED.', 'status': 'ok'});
    }

    if (_claimScenario != 'fraud') {
      steps.add({'delay': _claimScenario == 'amber' ? 5000 : 4000, 'icon': '💸', 'text': 'Payout calculated: 75% × ₹${appState.dailyBaseline} × $_claimDays days = ₹$calculatedPayout. Disbursing to ${appState.upiId}...', 'status': 'ok'});
      steps.add({'delay': _claimScenario == 'amber' ? 5800 : 4700, 'icon': '✅', 'text': '₹$calculatedPayout credited. Push notification + SMS sent in Marathi. Total time: ${_claimScenario == 'amber' ? '5.8' : '4.7'} seconds.', 'status': 'done'});
    }

    int prevDelay = 0;
    for (final step in steps) {
      await Future.delayed(Duration(milliseconds: (step['delay'] as int) - prevDelay));
      prevDelay = step['delay'] as int;
      if (mounted) {
        setState(() => _claimLogs.add(step));
      }
    }

    await Future.delayed(const Duration(milliseconds: 300));
    if (mounted) {
      setState(() {
        _processing = false;
        if (_claimScenario != 'fraud') {
          _payout = calculatedPayout;
        }
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_claimScenario != 'fraud' ? '₹$calculatedPayout payout credited to UPI!' : 'Fraud attempt detected and blocked.'),
          backgroundColor: _claimScenario != 'fraud' ? AppTheme.green : AppTheme.red,
        ),
      );
    }
  }

  Color _getLogColor(String status) {
    switch (status) {
      case 'checking':
        return AppTheme.text2;
      case 'ok':
        return AppTheme.greenLight;
      case 'warn':
        return AppTheme.yellow;
      case 'fraud':
        return const Color(0xFFF87171);
      case 'done':
        return AppTheme.greenLight;
      default:
        return AppTheme.text;
    }
  }

  @override
  Widget build(BuildContext context) {
    final totalPaidOut = _claimHistory.fold(0, (sum, c) => sum + (c['payout'] as int));

    return Scaffold(
      appBar: AppBar(title: const Text('Claims Management')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            HeroSection(
              tags: [TagChip.auto('ZERO-TOUCH'), TagChip.ml('AI FRAUD CHECK')],
              title: 'Claims Management',
              subtitle: 'Fully automated. No forms. No calls. Payout in 2-4 hours.',
            ),
            const SizedBox(height: 20),
            _buildCard([
              const Text('Zero-Touch Claim Flow', style: TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 16),
              Row(
                children: [
                  _buildFlowStep('📡', '1. Trigger', 'API threshold crossed'),
                  _buildFlowStep('🔍', '2. Validate', 'GPS & activity check'),
                  _buildFlowStep('🤖', '3. Fraud Score', 'ML model scores 0-100'),
                  _buildFlowStep('💸', '4. Payout', 'UPI credited'),
                ],
              ),
            ]),
            const SizedBox(height: 16),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: _buildCard([
                    const Text('Simulate Claim Processing', style: TextStyle(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: _claimTrigger,
                      decoration: const InputDecoration(labelText: 'Disruption Event'),
                      items: _triggerOptions.map((t) => DropdownMenuItem(
                        value: t['value'],
                        child: Text(t['label']!, style: const TextStyle(fontSize: 12)),
                      )).toList(),
                      onChanged: (v) => setState(() => _claimTrigger = v!),
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<int>(
                      value: _claimDays,
                      decoration: const InputDecoration(labelText: 'Days Affected'),
                      items: _dayOptions.map((d) => DropdownMenuItem(
                        value: d,
                        child: Text('$d day${d > 1 ? 's' : ''}'),
                      )).toList(),
                      onChanged: (v) => setState(() => _claimDays = v!),
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      value: _claimScenario,
                      decoration: const InputDecoration(labelText: 'Worker Scenario'),
                      items: _scenarioOptions.map((s) => DropdownMenuItem(
                        value: s['value'],
                        child: Text(s['label']!, style: const TextStyle(fontSize: 12)),
                      )).toList(),
                      onChanged: (v) => setState(() => _claimScenario = v!),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _processing ? null : _processClaim,
                      style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 48)),
                      child: _processing
                          ? const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)),
                                SizedBox(width: 8),
                                Text('Processing...'),
                              ],
                            )
                          : const Text('▶ Process Claim (Auto)'),
                    ),
                  ]),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildCard([
              const Text('Claim Processing Log', style: TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),
              if (_claimLogs.isEmpty)
                Container(
                  padding: const EdgeInsets.all(40),
                  alignment: Alignment.center,
                  child: Column(
                    children: [
                      const Text('📋', style: TextStyle(fontSize: 48)),
                      const SizedBox(height: 12),
                      const Text('Select a scenario and click "Process Claim" to see the automated flow'),
                    ],
                  ),
                )
              else
                Column(
                  children: [
                    ..._claimLogs.map((log) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(log['icon'] as String, style: const TextStyle(fontSize: 16)),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              log['text'] as String,
                              style: TextStyle(fontSize: 13, color: _getLogColor(log['status'] as String)),
                            ),
                          ),
                        ],
                      ),
                    )),
                    if (_payout != null) ...[
                      const Divider(),
                      Column(
                        children: [
                          const Text('💸', style: TextStyle(fontSize: 40)),
                          const SizedBox(height: 8),
                          Text(
                            '₹$_payout',
                            style: const TextStyle(fontFamily: 'Outfit', fontSize: 48, fontWeight: FontWeight.w800, color: AppTheme.greenLight),
                          ),
                          const SizedBox(height: 8),
                          Text('Credited to UPI in 4.7 seconds', style: const TextStyle(fontSize: 13, color: AppTheme.text2)),
                          const SizedBox(height: 8),
                          Badge.green('ZERO-TOUCH CLAIM COMPLETE'),
                        ],
                      ),
                    ],
                  ],
                ),
            ]),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Claim History', style: Theme.of(context).textTheme.headlineMedium),
                Badge.teal('Total: ₹${totalPaidOut.toStringAsFixed(0)}'),
              ],
            ),
            const SizedBox(height: 12),
            ..._claimHistory.map((claim) => _buildClaimCard(claim)),
          ],
        ),
      ),
    );
  }

  Widget _buildFlowStep(String icon, String step, String desc) {
    return Expanded(
      child: Column(
        children: [
          Text(icon, style: const TextStyle(fontSize: 24)),
          const SizedBox(height: 4),
          Text(step, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600)),
          const SizedBox(height: 2),
          Text(desc, style: const TextStyle(fontSize: 9, color: AppTheme.text2), textAlign: TextAlign.center),
        ],
      ),
    );
  }

  Widget _buildCard(List<Widget> children) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: children,
      ),
    );
  }

  Widget _buildClaimCard(Map<String, dynamic> claim) {
    final score = claim['score'] as int;
    final routeColor = score < 36 ? AppTheme.green : (score < 66 ? AppTheme.yellow : AppTheme.red);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(claim['id'] as String, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                    const SizedBox(width: 8),
                    Badge.green('✓ PAID'),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: routeColor.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        score < 36 ? '🟢 Green' : (score < 66 ? '🟡 Amber' : '🔴 Red'),
                        style: TextStyle(fontSize: 10, color: routeColor),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  '${claim['trigger']} • ${claim['days']} day${claim['days'] > 1 ? 's' : ''}',
                  style: const TextStyle(fontSize: 13, color: AppTheme.text2),
                ),
                const SizedBox(height: 4),
                Text(
                  '${claim['date']} • Fraud Score: $score/100',
                  style: const TextStyle(fontSize: 12, color: AppTheme.text2),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '₹${claim['payout']}',
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppTheme.greenLight),
              ),
              const Text('to UPI', style: TextStyle(fontSize: 12, color: AppTheme.text2)),
            ],
          ),
        ],
      ),
    );
  }
}
