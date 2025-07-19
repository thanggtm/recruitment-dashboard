using System.Collections.Generic;

namespace DashboardQHQT.Models
{
    public class ChartNguonTiepCanDTO
    {
        public string name { get; set; }
        public List<int?> data { get; set; }
        public string color { get; set; }
    }
}