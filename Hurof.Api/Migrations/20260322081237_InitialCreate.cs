using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Hurof.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Questions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Letter = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: false),
                    QuestionText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Answer = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Questions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Sessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RoomCode = table.Column<string>(type: "nvarchar(6)", maxLength: 6, nullable: false),
                    GridSize = table.Column<int>(type: "int", nullable: false),
                    Team1Color = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Team2Color = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    WinnerTeam = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    BuzzerLockedByPlayer = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BuzzerLockedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sessions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LetterCells",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Row = table.Column<int>(type: "int", nullable: false),
                    Col = table.Column<int>(type: "int", nullable: false),
                    Letter = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: false),
                    State = table.Column<int>(type: "int", nullable: false),
                    QuestionIndex = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LetterCells", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LetterCells_Sessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "Sessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Questions",
                columns: new[] { "Id", "Answer", "Letter", "QuestionText", "SortOrder" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000001"), "أ", "أ", "ما هو الحرف الأول من الأبجدية العربية؟", 1 },
                    { new Guid("00000000-0000-0000-0000-000000000002"), "أ", "أ", "أكمل الكلمة: _رض", 2 },
                    { new Guid("00000000-0000-0000-0000-000000000003"), "أ", "أ", "ما الحرف الذي تبدأ به كلمة 'أسد'؟", 3 },
                    { new Guid("00000000-0000-0000-0000-000000000004"), "ب", "ب", "ما هو حرف الجر الدال على الاستعانة؟", 1 },
                    { new Guid("00000000-0000-0000-0000-000000000005"), "ب", "ب", "أكمل الكلمة: _يت", 2 },
                    { new Guid("00000000-0000-0000-0000-000000000006"), "ب", "ب", "ما الحرف الذي تبدأ به كلمة 'بحر'؟", 3 },
                    { new Guid("00000000-0000-0000-0000-000000000007"), "ت", "ت", "ما الحرف الذي تبدأ به كلمة 'تفاح'؟", 1 },
                    { new Guid("00000000-0000-0000-0000-000000000008"), "ت", "ت", "أكمل الكلمة: _مر", 2 },
                    { new Guid("00000000-0000-0000-0000-000000000009"), "ت", "ت", "ما الحرف الثالث في الأبجدية العربية؟", 3 },
                    { new Guid("00000000-0000-0000-0000-000000000010"), "ج", "ج", "ما الحرف الذي تبدأ به كلمة 'جبل'؟", 1 },
                    { new Guid("00000000-0000-0000-0000-000000000011"), "ج", "ج", "أكمل الكلمة: _مل", 2 },
                    { new Guid("00000000-0000-0000-0000-000000000012"), "ج", "ج", "ما الحرف الذي يبدأ به اسم الجمل بالعربية؟", 3 },
                    { new Guid("00000000-0000-0000-0000-000000000013"), "ح", "ح", "ما الحرف الذي تبدأ به كلمة 'حصان'؟", 1 },
                    { new Guid("00000000-0000-0000-0000-000000000014"), "ح", "ح", "أكمل الكلمة: _ديقة", 2 },
                    { new Guid("00000000-0000-0000-0000-000000000015"), "ح", "ح", "ما حرف المد في كلمة 'بحر'؟", 3 },
                    { new Guid("00000000-0000-0000-0000-000000000016"), "خ", "خ", "ما الحرف الذي تبدأ به كلمة 'خبز'؟", 1 },
                    { new Guid("00000000-0000-0000-0000-000000000017"), "خ", "خ", "أكمل الكلمة: _روف", 2 },
                    { new Guid("00000000-0000-0000-0000-000000000018"), "خ", "خ", "ما الحرف الذي يبدأ به اسم الخروف بالعربية؟", 3 },
                    { new Guid("00000000-0000-0000-0000-000000000019"), "د", "د", "ما الحرف الذي تبدأ به كلمة 'دب'؟", 1 },
                    { new Guid("00000000-0000-0000-0000-000000000020"), "د", "د", "أكمل الكلمة: _فتر", 2 },
                    { new Guid("00000000-0000-0000-0000-000000000021"), "د", "د", "ما الحرف الذي يبدأ به 'درس'؟", 3 },
                    { new Guid("00000000-0000-0000-0000-000000000022"), "ر", "ر", "ما الحرف الذي تبدأ به كلمة 'رمان'؟", 1 },
                    { new Guid("00000000-0000-0000-0000-000000000023"), "ر", "ر", "أكمل الكلمة: _جل", 2 },
                    { new Guid("00000000-0000-0000-0000-000000000024"), "ر", "ر", "ما الحرف الذي يبدأ به 'روضة'؟", 3 },
                    { new Guid("00000000-0000-0000-0000-000000000025"), "ز", "ز", "ما الحرف الذي تبدأ به كلمة 'زهرة'؟", 1 },
                    { new Guid("00000000-0000-0000-0000-000000000026"), "ز", "ز", "أكمل الكلمة: _يتون", 2 },
                    { new Guid("00000000-0000-0000-0000-000000000027"), "ز", "ز", "ما الحرف الذي يبدأ به 'زرافة'؟", 3 },
                    { new Guid("00000000-0000-0000-0000-000000000028"), "س", "س", "ما الحرف الذي تبدأ به كلمة 'سمكة'؟", 1 },
                    { new Guid("00000000-0000-0000-0000-000000000029"), "س", "س", "أكمل الكلمة: _ماء", 2 },
                    { new Guid("00000000-0000-0000-0000-000000000030"), "س", "س", "ما الحرف الذي يبدأ به 'سيارة'؟", 3 },
                    { new Guid("00000000-0000-0000-0000-000000000031"), "ش", "ش", "ما الحرف الذي تبدأ به كلمة 'شجرة'؟", 1 },
                    { new Guid("00000000-0000-0000-0000-000000000032"), "ش", "ش", "أكمل الكلمة: _مس", 2 },
                    { new Guid("00000000-0000-0000-0000-000000000033"), "ش", "ش", "ما الحرف الذي يبدأ به 'شاطئ'؟", 3 },
                    { new Guid("00000000-0000-0000-0000-000000000034"), "ص", "ص", "ما الحرف الذي تبدأ به كلمة 'صقر'؟", 1 },
                    { new Guid("00000000-0000-0000-0000-000000000035"), "ص", "ص", "أكمل الكلمة: _حراء", 2 },
                    { new Guid("00000000-0000-0000-0000-000000000036"), "ص", "ص", "ما الحرف الذي يبدأ به 'صوت'؟", 3 },
                    { new Guid("00000000-0000-0000-0000-000000000037"), "ض", "ض", "ما الحرف الذي تبدأ به كلمة 'ضوء'؟", 1 },
                    { new Guid("00000000-0000-0000-0000-000000000038"), "ض", "ض", "أكمل الكلمة: _فدع", 2 },
                    { new Guid("00000000-0000-0000-0000-000000000039"), "ض", "ض", "ما الحرف الذي يبدأ به 'ضيف'؟", 3 },
                    { new Guid("00000000-0000-0000-0000-000000000040"), "ط", "ط", "ما الحرف الذي تبدأ به كلمة 'طائر'؟", 1 },
                    { new Guid("00000000-0000-0000-0000-000000000041"), "ط", "ط", "أكمل الكلمة: _اولة", 2 },
                    { new Guid("00000000-0000-0000-0000-000000000042"), "ط", "ط", "ما الحرف الذي يبدأ به 'طريق'؟", 3 },
                    { new Guid("00000000-0000-0000-0000-000000000043"), "ع", "ع", "ما الحرف الذي تبدأ به كلمة 'عصفور'؟", 1 },
                    { new Guid("00000000-0000-0000-0000-000000000044"), "ع", "ع", "أكمل الكلمة: _ين", 2 },
                    { new Guid("00000000-0000-0000-0000-000000000045"), "ع", "ع", "ما الحرف الذي يبدأ به 'علم'؟", 3 },
                    { new Guid("00000000-0000-0000-0000-000000000046"), "غ", "غ", "ما الحرف الذي تبدأ به كلمة 'غيمة'؟", 1 },
                    { new Guid("00000000-0000-0000-0000-000000000047"), "غ", "غ", "أكمل الكلمة: _ابة", 2 },
                    { new Guid("00000000-0000-0000-0000-000000000048"), "غ", "غ", "ما الحرف الذي يبدأ به 'غروب'؟", 3 },
                    { new Guid("00000000-0000-0000-0000-000000000049"), "ف", "ف", "ما الحرف الذي تبدأ به كلمة 'فيل'؟", 1 },
                    { new Guid("00000000-0000-0000-0000-000000000050"), "ف", "ف", "أكمل الكلمة: _راشة", 2 },
                    { new Guid("00000000-0000-0000-0000-000000000051"), "ف", "ف", "ما الحرف الذي يبدأ به 'فصل'؟", 3 },
                    { new Guid("00000000-0000-0000-0000-000000000052"), "ق", "ق", "ما الحرف الذي تبدأ به كلمة 'قمر'؟", 1 },
                    { new Guid("00000000-0000-0000-0000-000000000053"), "ق", "ق", "أكمل الكلمة: _طة", 2 },
                    { new Guid("00000000-0000-0000-0000-000000000054"), "ق", "ق", "ما الحرف الذي يبدأ به 'قلب'؟", 3 },
                    { new Guid("00000000-0000-0000-0000-000000000055"), "ك", "ك", "ما الحرف الذي تبدأ به كلمة 'كتاب'؟", 1 },
                    { new Guid("00000000-0000-0000-0000-000000000056"), "ك", "ك", "أكمل الكلمة: _لب", 2 },
                    { new Guid("00000000-0000-0000-0000-000000000057"), "ك", "ك", "ما الحرف الذي يبدأ به 'كرة'؟", 3 },
                    { new Guid("00000000-0000-0000-0000-000000000058"), "ل", "ل", "ما الحرف الذي تبدأ به كلمة 'ليمون'؟", 1 },
                    { new Guid("00000000-0000-0000-0000-000000000059"), "ل", "ل", "أكمل الكلمة: _يل", 2 },
                    { new Guid("00000000-0000-0000-0000-000000000060"), "ل", "ل", "ما الحرف الذي يبدأ به 'لغة'؟", 3 },
                    { new Guid("00000000-0000-0000-0000-000000000061"), "م", "م", "ما الحرف الذي تبدأ به كلمة 'مدرسة'؟", 1 },
                    { new Guid("00000000-0000-0000-0000-000000000062"), "م", "م", "أكمل الكلمة: _اء", 2 },
                    { new Guid("00000000-0000-0000-0000-000000000063"), "م", "م", "ما الحرف الذي يبدأ به 'مسجد'؟", 3 },
                    { new Guid("00000000-0000-0000-0000-000000000064"), "ن", "ن", "ما الحرف الذي تبدأ به كلمة 'نجمة'؟", 1 },
                    { new Guid("00000000-0000-0000-0000-000000000065"), "ن", "ن", "أكمل الكلمة: _هر", 2 },
                    { new Guid("00000000-0000-0000-0000-000000000066"), "ن", "ن", "ما الحرف الذي يبدأ به 'نور'؟", 3 },
                    { new Guid("00000000-0000-0000-0000-000000000067"), "ه", "ه", "ما الحرف الذي تبدأ به كلمة 'هرة'؟", 1 },
                    { new Guid("00000000-0000-0000-0000-000000000068"), "ه", "ه", "أكمل الكلمة: _واء", 2 },
                    { new Guid("00000000-0000-0000-0000-000000000069"), "ه", "ه", "ما الحرف الذي يبدأ به 'هلال'؟", 3 },
                    { new Guid("00000000-0000-0000-0000-000000000070"), "و", "و", "ما الحرف الذي تبدأ به كلمة 'ورد'؟", 1 },
                    { new Guid("00000000-0000-0000-0000-000000000071"), "و", "و", "أكمل الكلمة: _طن", 2 },
                    { new Guid("00000000-0000-0000-0000-000000000072"), "و", "و", "ما الحرف الذي يبدأ به 'وقت'؟", 3 },
                    { new Guid("00000000-0000-0000-0000-000000000073"), "ي", "ي", "ما الحرف الذي تبدأ به كلمة 'يد'؟", 1 },
                    { new Guid("00000000-0000-0000-0000-000000000074"), "ي", "ي", "أكمل الكلمة: _اسمين", 2 },
                    { new Guid("00000000-0000-0000-0000-000000000075"), "ي", "ي", "ما الحرف الأخير في الأبجدية العربية؟", 3 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_LetterCells_SessionId_Row_Col",
                table: "LetterCells",
                columns: new[] { "SessionId", "Row", "Col" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Questions_Letter_SortOrder",
                table: "Questions",
                columns: new[] { "Letter", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_RoomCode",
                table: "Sessions",
                column: "RoomCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LetterCells");

            migrationBuilder.DropTable(
                name: "Questions");

            migrationBuilder.DropTable(
                name: "Sessions");
        }
    }
}
