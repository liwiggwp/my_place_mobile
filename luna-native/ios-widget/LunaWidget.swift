import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(
            date: Date(),
            cycleDay: 14,
            cyclePhase: "Овуляция",
            nextPeriodDays: 14,
            pregnancyChance: "Высокая",
            waterCurrent: 1250,
            waterGoal: 2000,
            nextPillName: "Магний B6",
            nextPillTime: "21:30",
            pillsTaken: 2,
            pillsTotal: 3
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = loadCurrentData()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let entry = loadCurrentData()
        // Refresh every 30 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    private func loadCurrentData() -> SimpleEntry {
        let defaults = UserDefaults(suiteName: "group.com.luna.tracker")
        let cycleDay = defaults?.integer(forKey: "cycleDay") ?? 14
        let cyclePhase = defaults?.string(forKey: "cyclePhase") ?? "Фолликулярная"
        let nextPeriodDays = defaults?.integer(forKey: "nextPeriodDays") ?? 14
        let pregnancyChance = defaults?.string(forKey: "pregnancyChance") ?? "Низкая"
        
        let waterCurrent = defaults?.integer(forKey: "waterCurrent") ?? 1250
        let waterGoal = defaults?.integer(forKey: "waterGoal") ?? 2000
        
        let nextPillName = defaults?.string(forKey: "nextPillName") ?? "Витамин D3"
        let nextPillTime = defaults?.string(forKey: "nextPillTime") ?? "09:00"
        let pillsTaken = defaults?.integer(forKey: "pillsTaken") ?? 1
        let pillsTotal = defaults?.integer(forKey: "pillsTotal") ?? 2

        return SimpleEntry(
            date: Date(),
            cycleDay: max(1, cycleDay),
            cyclePhase: cyclePhase,
            nextPeriodDays: nextPeriodDays,
            pregnancyChance: pregnancyChance,
            waterCurrent: waterCurrent,
            waterGoal: max(1000, waterGoal),
            nextPillName: nextPillName,
            nextPillTime: nextPillTime,
            pillsTaken: pillsTaken,
            pillsTotal: pillsTotal
        )
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let cycleDay: Int
    let cyclePhase: String
    let nextPeriodDays: Int
    let pregnancyChance: String
    let waterCurrent: Int
    let waterGoal: Int
    let nextPillName: String
    let nextPillTime: String
    let pillsTaken: Int
    let pillsTotal: Int
}

// ==========================================
// SMALL WIDGET VIEW
// ==========================================
struct LunaWidgetSmallView: View {
    var entry: Provider.Entry

    var body: some View {
        ZStack {
            ContainerRelativeShape()
                .fill(LinearGradient(
                    gradient: Gradient(colors: [Color(hex: "FFF1F2"), Color(hex: "FCE7F3")]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                ))

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("🌸 LUNA")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(Color(hex: "F43F5E"))
                    Spacer()
                    Text("День \(entry.cycleDay)")
                        .font(.system(size: 11, weight: .black))
                        .foregroundColor(Color(hex: "1E293B"))
                }

                Text(entry.cyclePhase)
                    .font(.system(size: 13, weight: .heavy))
                    .foregroundColor(Color(hex: "E11D48"))
                    .lineLimit(1)

                Divider().background(Color(hex: "F43F5E").opacity(0.2))

                // Water line
                HStack(spacing: 4) {
                    Text("💧")
                        .font(.system(size: 10))
                    Text("\(entry.waterCurrent) / \(entry.waterGoal) мл")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(Color(hex: "0284C7"))
                }

                // Pill line
                HStack(spacing: 4) {
                    Text("💊")
                        .font(.system(size: 10))
                    Text("\(entry.nextPillName) (\(entry.nextPillTime))")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(Color(hex: "64748B"))
                        .lineLimit(1)
                }
            }
            .padding(12)
        }
    }
}

// ==========================================
// MEDIUM WIDGET VIEW (COMBO DASHBOARD)
// ==========================================
struct LunaWidgetMediumView: View {
    var entry: Provider.Entry

    var waterProgress: Double {
        Double(entry.waterCurrent) / Double(max(1, entry.waterGoal))
    }

    var body: some View {
        ZStack {
            ContainerRelativeShape()
                .fill(LinearGradient(
                    gradient: Gradient(colors: [Color(hex: "FFFFFF"), Color(hex: "FFF1F2")]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                ))

            HStack(spacing: 14) {
                // Left Column: Cycle info
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 4) {
                        Text("🌸")
                            .font(.system(size: 12))
                        Text("МОЙ ЦИКЛ")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(Color(hex: "F43F5E"))
                    }

                    HStack(alignment: .firstTextBaseline, spacing: 2) {
                        Text("\(entry.cycleDay)")
                            .font(.system(size: 28, weight: .black))
                            .foregroundColor(Color(hex: "1E293B"))
                        Text("день")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(Color(hex: "94A3B8"))
                    }

                    Text(entry.cyclePhase)
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(Color(hex: "E11D48"))

                    Text("Месячные через \(entry.nextPeriodDays) дн.")
                        .font(.system(size: 9, weight: .medium))
                        .foregroundColor(Color(hex: "64748B"))
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                Divider()
                    .frame(height: 90)
                    .background(Color(hex: "E2E8F0"))

                // Right Column: Water & Pills
                VStack(alignment: .leading, spacing: 10) {
                    // Water Section
                    VStack(alignment: .leading, spacing: 3) {
                        HStack {
                            Text("💧 Вода")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(Color(hex: "0284C7"))
                            Spacer()
                            Text("\(entry.waterCurrent) мл")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(Color(hex: "0369A1"))
                        }

                        // Progress Bar
                        GeometryReader { geo in
                            ZStack(alignment: .leading) {
                                Capsule()
                                    .fill(Color(hex: "E0F2FE"))
                                    .frame(height: 6)

                                Capsule()
                                    .fill(LinearGradient(
                                        gradient: Gradient(colors: [Color(hex: "38BDF8"), Color(hex: "0284C7")]),
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    ))
                                    .frame(width: min(geo.size.width * CGFloat(waterProgress), geo.size.width), height: 6)
                            }
                        }
                        .frame(height: 6)
                    }

                    // Pills Section
                    VStack(alignment: .leading, spacing: 2) {
                        HStack {
                            Text("💊 Таблетки")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(Color(hex: "7C3AED"))
                            Spacer()
                            Text("\(entry.pillsTaken)/\(entry.pillsTotal) принято")
                                .font(.system(size: 9, weight: .semibold))
                                .foregroundColor(Color(hex: "6D28D9"))
                        }

                        Text("\(entry.nextPillName) в \(entry.nextPillTime)")
                            .font(.system(size: 10, weight: .semibold))
                            .foregroundColor(Color(hex: "334155"))
                            .lineLimit(1)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
        }
    }
}

// ==========================================
// MAIN WIDGET ENTRY
// ==========================================
@main
struct LunaWidget: Widget {
    let kind: String = "LunaWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            LunaWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Luna: Трекер")
        .description("День цикла, уровень воды и напоминания о приеме таблеток на вашем рабочем столе.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct LunaWidgetEntryView : View {
    @Environment(\.widgetFamily) var family
    var entry: Provider.Entry

    var body: some View {
        switch family {
        case .systemSmall:
            LunaWidgetSmallView(entry: entry)
        default:
            LunaWidgetMediumView(entry: entry)
        }
    }
}

// Helper Color hex extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
