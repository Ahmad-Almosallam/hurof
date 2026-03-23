using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hurof.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPhpSessionConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PhpSessionConfigs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PhpSessionId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhpSessionConfigs", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "PhpSessionConfigs",
                columns: new[] { "Id", "PhpSessionId", "UpdatedAt" },
                values: new object[] { 1, "", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PhpSessionConfigs");
        }
    }
}
