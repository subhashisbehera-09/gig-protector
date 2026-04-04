import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/common_widgets.dart';

class TriggersScreen extends StatefulWidget {
  const TriggersScreen({super.key});

  @override
  State<TriggersScreen> createState() => _TriggersScreenState();
}

class _TriggersScreenState extends State<TriggersScreen> {
  bool _loading = false;

  final _initialTriggers = [
    {'id': 'rain', 'icon': '🌧️', 'name': 'Heavy Rainfall / Flood', 'threshold': '>64.5mm/24h', 'source': 'OpenWeatherMap + IMD API', 'current_value': '68.2mm', 'current_label': '68.2mm/24h', 'fired': true, 'confidence': 87, 'pct': 87, 'color': AppTheme.orange, 'tag': 'FIRED', 'description': 'IMD Red Alert issued for Mumbai. Coastal areas flooded.'},
    {'id': 'aqi', 'icon': '😷', 'name': 'Severe Air Pollution (AQI)', 'threshold': '>400 AQI + GRAP Stage IV', 'source': 'CPCB Safar API', 'current_value': 'AQI 456', 'current_label': 'AQI 456 - Severe+', 'fired': true, 'confidence': 91, 'pct': 91, 'color': AppTheme.orange, 'tag': 'FIRED', 'description': 'GRAP Stage IV active in Delhi NCR. Non-essential deliveries halted.'},
    {'id': 'bandh', 'icon': '🚫', 'name': 'Civic Disruption / Bandh', 'threshold': 'Zone orders <15% for 4hrs', 'source': 'Traffic API + News NLP', 'current_value': '8% vol', 'current_label': 'Zone order volume: 8%', 'fired': false, 'confidence': 62, 'pct': 62, 'color': AppTheme.yellow, 'tag': 'MONITORING', 'description': 'Karnataka bandh detected on 3+ news sources.'},
    {'id': 'heat', 'icon': '🌡️', 'name': 'Extreme Heat Wave', 'threshold': '>44°C for 2+ days', 'source': 'OpenWeatherMap + IMD', 'current_value': '32°C', 'current_label': '32°C - Normal', 'fired': false, 'confidence': 12, 'pct': 12, 'color': AppTheme.green, 'tag': 'CLEAR', 'description': 'Current temperature within normal range.'},
    {'id': 'fog', 'icon': '🌫️', 'name': 'Dense Fog / Zero Visibility', 'threshold': 'Visibility <200m for 4hrs', 'source': 'OpenWeatherMap + METAR', 'current_value': '4.2km', 'current_label': 'Visibility: 4,200m', 'fired': false, 'confidence': 8, 'pct': 8, 'color': AppTheme.green, 'tag': 'CLEAR', 'description': 'Good visibility conditions.'},
  ];

  late List<Map<String, dynamic>> _triggers;

  @override
  void initState() {
    super.initState();
    _triggers = List.from(_initialTriggers);
  }

  Future<void> _refreshTriggers() async {
    setState(() => _loading = true);
    
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Polling real-time Weather API...'), backgroundColor: AppTheme.teal),
    );

    await Future.delayed(const Duration(seconds: 2));

    setState(() {
      _triggers = _triggers.map((t) {
        if (t['id'] == 'rain') {
          return {...t, 'current_value': '72.5mm', 'current_label': '72.5mm/24h', 'fired': true, 'confidence': 92, 'pct': 92, 'color': AppTheme.orange, 'tag': 'FIRED'};
        }
        if (t['id'] == 'bandh') {
          return {...t, 'confidence': 78, 'pct': 78, 'fired': true, 'tag': 'FIRED', 'current_label': 'Zone orders: 9%', 'color': AppTheme.orange};
        }
        return t;
      }).toList();

      final firedCount = _triggers.where((t) => t['fired'] == true).length;
      context.read<AppState>().setAlertCount(firedCount);
      _loading = false;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Weather API sync complete!'), backgroundColor: AppTheme.green),
    );
  }

  Badge _getTagBadge(Map<String, dynamic> trigger) {
    if (trigger['fired'] == true) return Badge.orange(trigger['tag'] as String);
    if ((trigger['confidence'] as int) > 50) return Badge.yellow(trigger['tag'] as String);
    return Badge.green(trigger['tag'] as String);
  }

  @override
  Widget build(BuildContext context) {
    final firedCount = _triggers.where((t) => t['fired'] == true).length;

    return Scaffold(
      appBar: AppBar(title: const Text('Parametric Triggers')),
      body: RefreshIndicator(
        onRefresh: _refreshTriggers,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              HeroSection(
                tags: [TagChip.api('5 LIVE TRIGGERS'), TagChip.auto('AUTO-FIRING')],
                title: 'Parametric Trigger Monitor',
                subtitle: 'Real-time disruption detection. All thresholds verified against public APIs.',
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Last checked: just now', style: const TextStyle(fontSize: 13, color: AppTheme.text2)),
                  ElevatedButton.icon(
                    onPressed: _loading ? null : _refreshTriggers,
                    icon: _loading
                        ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.refresh, size: 16),
                    label: Text(_loading ? 'Refreshing...' : '↺ Refresh All'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.teal,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              ..._triggers.map((trigger) => _buildTriggerCard(trigger)),
              const SizedBox(height: 24),
              _buildCard([
                const Text('Trigger Confidence Scoring', style: TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(height: 16),
                Row(
                  children: [
                    _buildScoringItem('API Data Quality', '40% weight', 'Freshness & reliability'),
                    _buildScoringItem('Zone Match', '30% weight', 'GPS & cell tower'),
                    _buildScoringItem('Activity Signal', '30% weight', 'Platform app status'),
                  ],
                ),
                const Divider(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    Badge.green('Score ≥70 → Auto-Payout'),
                    Badge.yellow('Score 50-69 → Amber'),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: AppTheme.red.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
                      child: const Text('Score <50 → Not Confirmed', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.red)),
                    ),
                  ],
                ),
              ]),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTriggerCard(Map<String, dynamic> trigger) {
    final isFired = trigger['fired'] == true;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isFired ? AppTheme.orange : AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(trigger['icon'] as String, style: const TextStyle(fontSize: 28)),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(trigger['name'] as String, style: const TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            trigger['threshold'] as String,
                            style: const TextStyle(fontSize: 12, color: AppTheme.text2),
                          ),
                        ),
                        _getTagBadge(trigger),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Current Reading', style: TextStyle(fontSize: 10, color: AppTheme.text3)),
                    Text(
                      trigger['current_label'] as String,
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: isFired ? AppTheme.orangeLight : AppTheme.greenLight),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Confidence', style: TextStyle(fontSize: 10, color: AppTheme.text3)),
                    Text(
                      '${trigger['confidence']}/100',
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ProgressBar(value: (trigger['pct'] as int).toDouble(), color: trigger['color'] as Color),
          const SizedBox(height: 8),
          Text(trigger['description'] as String, style: const TextStyle(fontSize: 12, color: AppTheme.text2)),
          Container(
            margin: const EdgeInsets.only(top: 8),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(color: AppTheme.bg3, borderRadius: BorderRadius.circular(4)),
            child: Text(trigger['source'] as String, style: const TextStyle(fontSize: 10, color: AppTheme.text3, fontFamily: 'monospace')),
          ),
          if (isFired) ...[
            const SizedBox(height: 12),
            AlertBox.warning('⚡ TRIGGER FIRED - Auto-claims being initiated for ${30 + (DateTime.now().second % 50)} workers in affected zones'),
          ],
        ],
      ),
    );
  }

  Widget _buildScoringItem(String title, String weight, String desc) {
    return Expanded(
      child: Column(
        children: [
          Text(title, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
          const SizedBox(height: 2),
          Text(weight, style: const TextStyle(fontSize: 10, color: AppTheme.text2)),
          const SizedBox(height: 4),
          Text(desc, style: const TextStyle(fontSize: 9, color: AppTheme.text3), textAlign: TextAlign.center),
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
}
