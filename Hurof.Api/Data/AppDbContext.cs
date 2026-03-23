using Hurof.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Hurof.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<GameSession> Sessions { get; set; }
    public DbSet<LetterCell> LetterCells { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<PhpSessionConfig> PhpSessionConfigs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<LetterCell>()
            .HasIndex(lc => new { lc.SessionId, lc.Row, lc.Col })
            .IsUnique();

        modelBuilder.Entity<GameSession>()
            .HasIndex(s => s.RoomCode)
            .IsUnique();

        modelBuilder.Entity<GameSession>()
            .Property(s => s.RoomCode)
            .HasMaxLength(6);

        modelBuilder.Entity<LetterCell>()
            .HasOne(lc => lc.Session)
            .WithMany(s => s.LetterCells)
            .HasForeignKey(lc => lc.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Question>()
            .HasIndex(q => new { q.Letter, q.SortOrder });

        modelBuilder.Entity<GameSession>()
            .Property(s => s.Team1Color).HasMaxLength(20);

        modelBuilder.Entity<GameSession>()
            .Property(s => s.Team2Color).HasMaxLength(20);

        modelBuilder.Entity<LetterCell>()
            .Property(lc => lc.Letter).HasMaxLength(5);

        modelBuilder.Entity<Question>()
            .Property(q => q.Letter).HasMaxLength(5);

        modelBuilder.Entity<PhpSessionConfig>()
            .HasData(new PhpSessionConfig { Id = 1, PhpSessionId = "", UpdatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) });

        SeedQuestions(modelBuilder);
    }

    private static void SeedQuestions(ModelBuilder modelBuilder)
    {
        var questions = new List<Question>
        {
            // أ
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000001"), Letter = "أ", QuestionText = "ما هو الحرف الأول من الأبجدية العربية؟", Answer = "أ", SortOrder = 1 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000002"), Letter = "أ", QuestionText = "أكمل الكلمة: _رض", Answer = "أ", SortOrder = 2 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000003"), Letter = "أ", QuestionText = "ما الحرف الذي تبدأ به كلمة 'أسد'؟", Answer = "أ", SortOrder = 3 },

            // ب
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000004"), Letter = "ب", QuestionText = "ما هو حرف الجر الدال على الاستعانة؟", Answer = "ب", SortOrder = 1 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000005"), Letter = "ب", QuestionText = "أكمل الكلمة: _يت", Answer = "ب", SortOrder = 2 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000006"), Letter = "ب", QuestionText = "ما الحرف الذي تبدأ به كلمة 'بحر'؟", Answer = "ب", SortOrder = 3 },

            // ت
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000007"), Letter = "ت", QuestionText = "ما الحرف الذي تبدأ به كلمة 'تفاح'؟", Answer = "ت", SortOrder = 1 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000008"), Letter = "ت", QuestionText = "أكمل الكلمة: _مر", Answer = "ت", SortOrder = 2 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000009"), Letter = "ت", QuestionText = "ما الحرف الثالث في الأبجدية العربية؟", Answer = "ت", SortOrder = 3 },

            // ج
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000010"), Letter = "ج", QuestionText = "ما الحرف الذي تبدأ به كلمة 'جبل'؟", Answer = "ج", SortOrder = 1 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000011"), Letter = "ج", QuestionText = "أكمل الكلمة: _مل", Answer = "ج", SortOrder = 2 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000012"), Letter = "ج", QuestionText = "ما الحرف الذي يبدأ به اسم الجمل بالعربية؟", Answer = "ج", SortOrder = 3 },

            // ح
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000013"), Letter = "ح", QuestionText = "ما الحرف الذي تبدأ به كلمة 'حصان'؟", Answer = "ح", SortOrder = 1 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000014"), Letter = "ح", QuestionText = "أكمل الكلمة: _ديقة", Answer = "ح", SortOrder = 2 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000015"), Letter = "ح", QuestionText = "ما حرف المد في كلمة 'بحر'؟", Answer = "ح", SortOrder = 3 },

            // خ
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000016"), Letter = "خ", QuestionText = "ما الحرف الذي تبدأ به كلمة 'خبز'؟", Answer = "خ", SortOrder = 1 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000017"), Letter = "خ", QuestionText = "أكمل الكلمة: _روف", Answer = "خ", SortOrder = 2 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000018"), Letter = "خ", QuestionText = "ما الحرف الذي يبدأ به اسم الخروف بالعربية؟", Answer = "خ", SortOrder = 3 },

            // د
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000019"), Letter = "د", QuestionText = "ما الحرف الذي تبدأ به كلمة 'دب'؟", Answer = "د", SortOrder = 1 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000020"), Letter = "د", QuestionText = "أكمل الكلمة: _فتر", Answer = "د", SortOrder = 2 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000021"), Letter = "د", QuestionText = "ما الحرف الذي يبدأ به 'درس'؟", Answer = "د", SortOrder = 3 },

            // ر
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000022"), Letter = "ر", QuestionText = "ما الحرف الذي تبدأ به كلمة 'رمان'؟", Answer = "ر", SortOrder = 1 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000023"), Letter = "ر", QuestionText = "أكمل الكلمة: _جل", Answer = "ر", SortOrder = 2 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000024"), Letter = "ر", QuestionText = "ما الحرف الذي يبدأ به 'روضة'؟", Answer = "ر", SortOrder = 3 },

            // ز
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000025"), Letter = "ز", QuestionText = "ما الحرف الذي تبدأ به كلمة 'زهرة'؟", Answer = "ز", SortOrder = 1 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000026"), Letter = "ز", QuestionText = "أكمل الكلمة: _يتون", Answer = "ز", SortOrder = 2 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000027"), Letter = "ز", QuestionText = "ما الحرف الذي يبدأ به 'زرافة'؟", Answer = "ز", SortOrder = 3 },

            // س
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000028"), Letter = "س", QuestionText = "ما الحرف الذي تبدأ به كلمة 'سمكة'؟", Answer = "س", SortOrder = 1 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000029"), Letter = "س", QuestionText = "أكمل الكلمة: _ماء", Answer = "س", SortOrder = 2 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000030"), Letter = "س", QuestionText = "ما الحرف الذي يبدأ به 'سيارة'؟", Answer = "س", SortOrder = 3 },

            // ش
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000031"), Letter = "ش", QuestionText = "ما الحرف الذي تبدأ به كلمة 'شجرة'؟", Answer = "ش", SortOrder = 1 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000032"), Letter = "ش", QuestionText = "أكمل الكلمة: _مس", Answer = "ش", SortOrder = 2 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000033"), Letter = "ش", QuestionText = "ما الحرف الذي يبدأ به 'شاطئ'؟", Answer = "ش", SortOrder = 3 },

            // ص
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000034"), Letter = "ص", QuestionText = "ما الحرف الذي تبدأ به كلمة 'صقر'؟", Answer = "ص", SortOrder = 1 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000035"), Letter = "ص", QuestionText = "أكمل الكلمة: _حراء", Answer = "ص", SortOrder = 2 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000036"), Letter = "ص", QuestionText = "ما الحرف الذي يبدأ به 'صوت'؟", Answer = "ص", SortOrder = 3 },

            // ض
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000037"), Letter = "ض", QuestionText = "ما الحرف الذي تبدأ به كلمة 'ضوء'؟", Answer = "ض", SortOrder = 1 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000038"), Letter = "ض", QuestionText = "أكمل الكلمة: _فدع", Answer = "ض", SortOrder = 2 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000039"), Letter = "ض", QuestionText = "ما الحرف الذي يبدأ به 'ضيف'؟", Answer = "ض", SortOrder = 3 },

            // ط
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000040"), Letter = "ط", QuestionText = "ما الحرف الذي تبدأ به كلمة 'طائر'؟", Answer = "ط", SortOrder = 1 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000041"), Letter = "ط", QuestionText = "أكمل الكلمة: _اولة", Answer = "ط", SortOrder = 2 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000042"), Letter = "ط", QuestionText = "ما الحرف الذي يبدأ به 'طريق'؟", Answer = "ط", SortOrder = 3 },

            // ع
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000043"), Letter = "ع", QuestionText = "ما الحرف الذي تبدأ به كلمة 'عصفور'؟", Answer = "ع", SortOrder = 1 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000044"), Letter = "ع", QuestionText = "أكمل الكلمة: _ين", Answer = "ع", SortOrder = 2 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000045"), Letter = "ع", QuestionText = "ما الحرف الذي يبدأ به 'علم'؟", Answer = "ع", SortOrder = 3 },

            // غ
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000046"), Letter = "غ", QuestionText = "ما الحرف الذي تبدأ به كلمة 'غيمة'؟", Answer = "غ", SortOrder = 1 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000047"), Letter = "غ", QuestionText = "أكمل الكلمة: _ابة", Answer = "غ", SortOrder = 2 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000048"), Letter = "غ", QuestionText = "ما الحرف الذي يبدأ به 'غروب'؟", Answer = "غ", SortOrder = 3 },

            // ف
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000049"), Letter = "ف", QuestionText = "ما الحرف الذي تبدأ به كلمة 'فيل'؟", Answer = "ف", SortOrder = 1 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000050"), Letter = "ف", QuestionText = "أكمل الكلمة: _راشة", Answer = "ف", SortOrder = 2 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000051"), Letter = "ف", QuestionText = "ما الحرف الذي يبدأ به 'فصل'؟", Answer = "ف", SortOrder = 3 },

            // ق
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000052"), Letter = "ق", QuestionText = "ما الحرف الذي تبدأ به كلمة 'قمر'؟", Answer = "ق", SortOrder = 1 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000053"), Letter = "ق", QuestionText = "أكمل الكلمة: _طة", Answer = "ق", SortOrder = 2 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000054"), Letter = "ق", QuestionText = "ما الحرف الذي يبدأ به 'قلب'؟", Answer = "ق", SortOrder = 3 },

            // ك
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000055"), Letter = "ك", QuestionText = "ما الحرف الذي تبدأ به كلمة 'كتاب'؟", Answer = "ك", SortOrder = 1 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000056"), Letter = "ك", QuestionText = "أكمل الكلمة: _لب", Answer = "ك", SortOrder = 2 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000057"), Letter = "ك", QuestionText = "ما الحرف الذي يبدأ به 'كرة'؟", Answer = "ك", SortOrder = 3 },

            // ل
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000058"), Letter = "ل", QuestionText = "ما الحرف الذي تبدأ به كلمة 'ليمون'؟", Answer = "ل", SortOrder = 1 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000059"), Letter = "ل", QuestionText = "أكمل الكلمة: _يل", Answer = "ل", SortOrder = 2 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000060"), Letter = "ل", QuestionText = "ما الحرف الذي يبدأ به 'لغة'؟", Answer = "ل", SortOrder = 3 },

            // م
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000061"), Letter = "م", QuestionText = "ما الحرف الذي تبدأ به كلمة 'مدرسة'؟", Answer = "م", SortOrder = 1 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000062"), Letter = "م", QuestionText = "أكمل الكلمة: _اء", Answer = "م", SortOrder = 2 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000063"), Letter = "م", QuestionText = "ما الحرف الذي يبدأ به 'مسجد'؟", Answer = "م", SortOrder = 3 },

            // ن
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000064"), Letter = "ن", QuestionText = "ما الحرف الذي تبدأ به كلمة 'نجمة'؟", Answer = "ن", SortOrder = 1 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000065"), Letter = "ن", QuestionText = "أكمل الكلمة: _هر", Answer = "ن", SortOrder = 2 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000066"), Letter = "ن", QuestionText = "ما الحرف الذي يبدأ به 'نور'؟", Answer = "ن", SortOrder = 3 },

            // ه
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000067"), Letter = "ه", QuestionText = "ما الحرف الذي تبدأ به كلمة 'هرة'؟", Answer = "ه", SortOrder = 1 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000068"), Letter = "ه", QuestionText = "أكمل الكلمة: _واء", Answer = "ه", SortOrder = 2 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000069"), Letter = "ه", QuestionText = "ما الحرف الذي يبدأ به 'هلال'؟", Answer = "ه", SortOrder = 3 },

            // و
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000070"), Letter = "و", QuestionText = "ما الحرف الذي تبدأ به كلمة 'ورد'؟", Answer = "و", SortOrder = 1 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000071"), Letter = "و", QuestionText = "أكمل الكلمة: _طن", Answer = "و", SortOrder = 2 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000072"), Letter = "و", QuestionText = "ما الحرف الذي يبدأ به 'وقت'؟", Answer = "و", SortOrder = 3 },

            // ي
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000073"), Letter = "ي", QuestionText = "ما الحرف الذي تبدأ به كلمة 'يد'؟", Answer = "ي", SortOrder = 1 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000074"), Letter = "ي", QuestionText = "أكمل الكلمة: _اسمين", Answer = "ي", SortOrder = 2 },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000075"), Letter = "ي", QuestionText = "ما الحرف الأخير في الأبجدية العربية؟", Answer = "ي", SortOrder = 3 },
        };

        modelBuilder.Entity<Question>().HasData(questions);
    }
}
