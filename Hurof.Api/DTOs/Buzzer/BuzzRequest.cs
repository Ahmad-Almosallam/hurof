using System.ComponentModel.DataAnnotations;

namespace Hurof.Api.DTOs.Buzzer;

public record BuzzRequest([Required] string PlayerName);
