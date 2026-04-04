import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/common_widgets.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = context.watch<AppState>();

    final selectedTier = appState.selectedTier == 'basic'
        ? {'premium': 72, 'coverage': 60, 'name': 'Basic Shield'}
        : appState.selectedTier == 'premium'
            ? {'premium': 108, 'coverage': 90, 'name': 'Premium Shield'}
            : {'premium': 91, 'coverage': 75, 'name': 'Standard Shield'};

    final totalPaidOut = 8450;
    final claimsThisYear = 6;
    final activeTriggers = appState.alertCount > 0 ? appState.alertCount : 2;

    final activities = [
      {'icon': '💸', 'text': '₹1,575 payout credited - Heavy Rain (3 days)', 'time': 'Today, 9:30 AM'},
      {'icon': '⚡', 'text': 'Trigger fired: IMD Red Alert - Mumbai', 'time': 'Today, 7:02 AM'},
      {'icon': '📊', 'text': 'Weekly premium ₹91 debited via UPI AutoPay', 'time': 'Mon, Apr 1'},
      {'icon': '🔄', 'text': 'Premium recalculated - new zone risk data', 'time': 'Mar 25'},
      {'icon': '💸', 'text': '₹525 payout - Dense Fog (1 day)', 'time': 'Feb 28'},
      {'icon': '✅', 'text': 'Policy renewed - Standard Shield active', 'time': 'Feb 19'},
    ];

    final zones = [
      {'name': 'Andheri W - HIGH', 'top': 0.4, 'left': 0.35, 'color': AppTheme.orange.withOpacity(0.75)},
      {'name': 'Kurla - HIGH', 'top': 0.5, 'left': 0.5, 'color': AppTheme.orange.withOpacity(0.75)},
      {'name': 'Bandra - MED', 'top': 0.35, 'left': 0.6, 'color': AppTheme.yellow.withOpacity(0.75)},
      {'name': 'Dadar - MED', 'top': 0.6, 'left': 0.55, 'color': AppTheme.yellow.withOpacity(0.75)},
      {'name': 'Colaba - LOW', 'top': 0.7, 'left': 0.4, 'color': AppTheme.green.withOpacity(0.75)},
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Worker Dashboard')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            HeroSection(
              tags: [],
              title: 'Worker Dashboard',
              subtitle: '${appState.workerName} - ${_getPlatformEmoji(appState.platform)} Partner, ${appState.zone.substring(0, 1).toUpperCase()}${appState.zone.substring(1)}, ${appState.city.substring(0, 1).toUpperCase()}${appState.city.substring(1)}',
            ),
            const SizedBox(height: 20),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.3,
              children: [
                StatCard(icon: '🛡️', value: 'Active', label: 'Coverage Status', valueColor: AppTheme.greenLight),
                StatCard(icon: '💸', value: '₹$totalPaidOut', label: 'Total Paid Out', valueColor: AppTheme.blueLight),
                StatCard(icon: '📋', value: '$claimsThisYear', label: 'Claims This Year'),
                StatCard(icon: '⚡', value: '$activeTriggers', label: 'Active Triggers', valueColor: AppTheme.orangeLight),
              ],
            ),
            const SizedBox(height: 24),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: _buildCard([
                    const Text('Current Coverage', style: TextStyle(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: AppTheme.bg3,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        children: [
                          const Text('Weekly Premium', style: TextStyle(fontSize: 11, color: AppTheme.text3, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 4),
                          Text('₹${selectedTier['premium']}', style: const TextStyle(fontFamily: 'Outfit', fontSize: 36, fontWeight: FontWeight.w800, color: AppTheme.blueLight)),
                          Text('${selectedTier['name']} • ${selectedTier['coverage']}% income replacement', style: const TextStyle(fontSize: 11, color: AppTheme.text2)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildRiskRow('Next Auto-Debit', 'Monday Apr 7 - ₹${selectedTier['premium']}'),
                    _buildRiskRow('Policy #', appState.workerId, valueColor: AppTheme.blueLight),
                    _buildRiskRow('Loyalty Discount', '', badge: Badge.teal('-5% (Q2 - 14 weeks)')),
                    const SizedBox(height: 16),
                    AlertBox.success('Coverage active. $activeTriggers triggers currently being monitored in your zone.'),
                  ]),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildCard([
              const Text('Recent Activity', style: TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 16),
              ...activities.map((activity) => _buildActivityItem(activity)),
            ]),
            const SizedBox(height: 24),
            Text('Zone Risk Overview - ${appState.city.substring(0, 1).toUpperCase()}${appState.city.substring(1)}', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 12),
            _buildCard([
              SizedBox(
                height: 200,
                child: Stack(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [Color(0xFF0D1B2A), Color(0xFF1A2F45)]),
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    Positioned.fill(
                      child: CustomPaint(
                        painter: _GridPainter(),
                      ),
                    ),
                    ...zones.map((zone) => Positioned(
                      top: 200 * zone['top']! - 15,
                      left: null,
                      right: null,
                      child: FractionallySizedBox(
                        widthFactor: 0.35,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: zone['color'] as Color,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            zone['name'] as String,
                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ),
                    )),
                    Positioned(
                      bottom: 8,
                      right: 12,
                      child: Text(
                        '📍 Your zone - ${appState.zone.substring(0, 1).toUpperCase()}${appState.zone.substring(1)} West',
                        style: const TextStyle(fontSize: 10, color: AppTheme.text3),
                      ),
                    ),
                  ],
                ),
              ),
            ]),
          ],
        ),
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

  Widget _buildRiskRow(String label, String value, {Color? valueColor, Widget? badge}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: AppTheme.text2)),
          badge ?? Text(value, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: valueColor)),
        ],
      ),
    );
  }

  Widget _buildActivityItem(Map<String, dynamic> activity) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 16,
            height: 16,
            margin: const EdgeInsets.only(top: 2),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppTheme.green,
              border: Border.all(color: AppTheme.green, width: 2),
            ),
            child: Center(
              child: Text(activity['icon'] as String, style: const TextStyle(fontSize: 8)),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(activity['text'] as String, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text(activity['time'] as String, style: const TextStyle(fontSize: 12, color: AppTheme.text2)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _getPlatformEmoji(String platform) {
    switch (platform) {
      case 'zomato':
        return '🍕 Zomato';
      case 'swiggy':
        return '🧡 Swiggy';
      case 'zepto':
        return '⚡ Zepto';
      case 'amazon':
        return '📦 Amazon';
      case 'dunzo':
        return '🏃 Dunzo';
      default:
        return platform;
    }
  }
}

class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppTheme.blue.withOpacity(0.08)
      ..strokeWidth = 1;

    const spacing = 30.0;

    for (double x = 0; x <= size.width; x += spacing) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }

    for (double y = 0; y <= size.height; y += spacing) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
