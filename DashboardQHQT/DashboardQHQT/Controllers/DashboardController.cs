using DashboardQHQT.DBConnection;
using DashboardQHQT.Models;
using DashboardTuyenSinh.Areas.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;

namespace DashboardQHQT.Controllers
{
    public class DashboardController : Controller
    {
        private TuyenSinhDashboardQHQTDataContext db = new TuyenSinhDashboardQHQTDataContext();
        private List<NganhDTO> lstNganhDTO = new List<NganhDTO>();
        private string[] ArrColor = { "orange", "red", "green" };
        private string[] ArrColorNguonTiepCan = { "orange", "red", "green", "purple", "magenta", "darkblue" };

        public ActionResult Index()
        {
            //lấy danh sách các số liệu đăng ký, nhập học
            int indexColor = 0;
            List<SoLuongDangKyNhapHocDTO> lstSoLuongDKNH = new List<SoLuongDangKyNhapHocDTO>();
            List<YearDTO> lstYear = new List<YearDTO>();
            List<KhuVucDTO> lstKhuVuc = new List<KhuVucDTO>();

            //lấy danh sách các năm tuyển sinh
            var lstYearTemp = db.sp_dim_namtuyensinh_select_all().ToList();
            string[] ArrYear = lstYearTemp.OrderByDescending(x => x.Nam).Select(x => x.TenNam).Take(3).ToArray();

            lstYear = lstYearTemp.Select(x => new YearDTO()
            {
                Year = x.TenNam,
                isSelected = int.Parse(x.TenNam) == (DateTime.Now.Year - 1) ? true : false
            }).ToList();

            foreach (var year in ArrYear)
            {
                SoLuongDangKyNhapHocDTO dto = new SoLuongDangKyNhapHocDTO();
                dto.Color = ArrColor[indexColor++];
                dto.Nam = year;

                //lấy số lượng đăng ký
                var SoLuongDangKy = db.sp_fact_dangky_tongtheonam(int.Parse(year)).ToList();
                dto.SoLuongDangKy = int.Parse(SoLuongDangKy.Select(x => x.TongSo).FirstOrDefault().ToString());
                if ((indexColor - 1) != ArrYear.Count() - 1)
                {
                    dto.GiaoDongDangKy = GetGiaoDongDangKyNhapHoc(int.Parse(year), "dk");
                    dto.GiaoDongNhapHoc = GetGiaoDongDangKyNhapHoc(int.Parse(year), "nh");
                }
                else
                {
                    dto.GiaoDongDangKy = "";
                    dto.GiaoDongNhapHoc = "";
                }

                //lấy số lượng nhập học
                var SoLuongNhapHoc = db.sp_fact_nhaphoc_tongtheonam(int.Parse(year)).ToList();
                dto.SoLuongNhapHoc = int.Parse(SoLuongNhapHoc.Select(x => x.TongSo).FirstOrDefault().ToString());
                lstSoLuongDKNH.Add(dto);
            }
            ViewBag.ListNamTuyenSinh = lstYear;
            GetCoSo();
            GetKhuVuc();
            GetNganh();
            GetHinhThucTuyenSinh();
            ViewBag.SoLuongDKNH = lstSoLuongDKNH;

            return View();
        }

        public string GetGiaoDongDangKyNhapHoc(int Year, string Loai)
        {
            string GiaoDong = "";
            double SoLuongNam = 0;
            double SoLuongNamSau = 1;

            if (Loai == "dk")
            {
                SoLuongNam = double.Parse(db.sp_fact_dangky_tongtheonam(Year).FirstOrDefault().TongSo.ToString());
                SoLuongNamSau = double.Parse(db.sp_fact_dangky_tongtheonam(Year - 1).FirstOrDefault().TongSo.ToString());
            }
            else
            {
                SoLuongNam = double.Parse(db.sp_fact_nhaphoc_tongtheonam(Year).FirstOrDefault().TongSo.ToString());
                SoLuongNamSau = double.Parse(db.sp_fact_nhaphoc_tongtheonam(Year - 1).FirstOrDefault().TongSo.ToString());
            }

            double GiaoDongSoLuong = SoLuongNam - SoLuongNamSau;
            float Percent = float.Parse(Math.Round(100 * Math.Abs(GiaoDongSoLuong) / SoLuongNamSau, 2).ToString());

            if (GiaoDongSoLuong < 0)
                GiaoDong = "(Giảm " + Percent + " % so với năm " + (Year - 1) + ")";
            else
                GiaoDong = "(Tăng " + Percent + " % so với năm " + (Year - 1) + ")";
            return GiaoDong;
        }

        [HttpPost]
        public JsonResult GetDataNguonTiepCan(List<string> lstYear, string TypeChart, string MaKhuVuc)
        {
            List<ChartNguonTiepCanDTO> result = new List<ChartNguonTiepCanDTO>();
            List<DataForPieChartDTO> resultPieChart = new List<DataForPieChartDTO>();
            List<GridNguonTiepCanDTO> dataForGrid = new List<GridNguonTiepCanDTO>();
            List<string> lstColor = new List<string>(new string[] { "#ffa534", "#23ccef", "#fb404b" });
            string label = "Biểu đồ Thống kê Nguồn tiếp cận năm ";
            double TotalNumber = 0;

            //lấy danh sách các nguồn tiếp cận
            int indexColor = 0;
            int index = 1;

            if (MaKhuVuc == "all")
                MaKhuVuc = null;
            var lstNguonTiepCan = db.sp_dim_nguontiepcan_select_all().Select(x => new NguonTiepCanDTO()
            {
                MaNguonTiepCan = x.MaNguon,
                TenNguonTiepCan = x.TenNguon,
            }).ToList();

            foreach (var year in lstYear)
            {
                if (TypeChart == "soluong")
                {
                    if (indexColor == 0)
                        label += year;
                    else
                        label += " - " + year;
                    //lấy số lượng thống kê cho từng nguồn tiếp cận theo năm và mã khu vực
                    ChartNguonTiepCanDTO chartNTCDTO = new ChartNguonTiepCanDTO();
                    chartNTCDTO.name = year;
                    chartNTCDTO.color = lstColor[indexColor++];

                    List<int?> lstPoint = new List<int?>();
                    foreach (var nguonTiepCan in lstNguonTiepCan)
                    {
                        var temp = db.sp_tonghop_nguontiepcan(int.Parse(year), MaKhuVuc, nguonTiepCan.MaNguonTiepCan).FirstOrDefault();
                        lstPoint.Add(int.Parse(temp.SoLuong.ToString()));

                        //grid
                        GridNguonTiepCanDTO dto = new GridNguonTiepCanDTO();
                        dto.STT = index++;
                        dto.TenNguonTiepCan = nguonTiepCan.TenNguonTiepCan;
                        dto.Year = year;
                        dto.SoLuong = int.Parse(temp.SoLuong.ToString());
                        dto.KhuVuc = MaKhuVuc == null ? "Tất cả khu vực" : db.sp_dim_khuvuc_select_all().
                            Where(x => x.MaKhuVuc == MaKhuVuc).FirstOrDefault().TenKhuVuc;
                        dataForGrid.Add(dto);
                    }
                    chartNTCDTO.data = lstPoint;
                    result.Add(chartNTCDTO);
                }
                else
                {
                    index = 0;
                    indexColor = 0;
                    foreach (var nguonTiepCan in lstNguonTiepCan)
                    {
                        DataForPieChartDTO dto = new DataForPieChartDTO();
                        dto.category = nguonTiepCan.TenNguonTiepCan;
                        dto.color = ArrColorNguonTiepCan[indexColor++];

                        var temp = db.sp_tonghop_nguontiepcan(int.Parse(year), MaKhuVuc, nguonTiepCan.MaNguonTiepCan).FirstOrDefault();
                        dto.value = float.Parse(temp.SoLuong.ToString());
                        TotalNumber += double.Parse(temp.SoLuong.ToString());

                        //grid
                        GridNguonTiepCanDTO gridDTO = new GridNguonTiepCanDTO();
                        gridDTO.STT = index++;
                        gridDTO.TenNguonTiepCan = nguonTiepCan.TenNguonTiepCan;
                        gridDTO.Year = year;
                        gridDTO.SoLuong = int.Parse(temp.SoLuong.ToString());
                        gridDTO.KhuVuc = MaKhuVuc == null ? "Tất cả khu vực" : db.sp_dim_khuvuc_select_all().
                            Where(x => x.MaKhuVuc == MaKhuVuc).FirstOrDefault().TenKhuVuc;
                        dataForGrid.Add(gridDTO);

                        resultPieChart.Add(dto);
                    }

                    int indexTemp = 0;
                    float TotalPercent = 0;
                    foreach (var nguonTiepCan in resultPieChart)
                    {
                        if (nguonTiepCan.value != 0 && indexTemp != resultPieChart.Count() - 1)
                        {
                            nguonTiepCan.value = float.Parse(Math.Round((100 * nguonTiepCan.value) / TotalNumber, 1).ToString());
                            TotalPercent += float.Parse(Math.Round(nguonTiepCan.value, 1).ToString());
                        }
                        else if (nguonTiepCan.value != 0)
                            nguonTiepCan.value = float.Parse(Math.Round(100 - TotalPercent, 1).ToString());
                        indexTemp++;
                    }
                    return Json(new { resultPieChart, dataForGrid }, JsonRequestBehavior.AllowGet);
                }
            }

            var ArrNguonTiepCan = lstNguonTiepCan.Select(x => x.TenNguonTiepCan).ToArray();
            if (MaKhuVuc != "all" && MaKhuVuc != null)
            {
                var temp = db.sp_dim_khuvuc_select_all().Where(x => x.MaKhuVuc == MaKhuVuc).FirstOrDefault().TenKhuVuc;
                label += " tại Khu vực " + temp;
            }

            return Json(new { result, ArrNguonTiepCan, dataForGrid, label }, JsonRequestBehavior.AllowGet);
        }

        public string GetIconNguonTiepCan(string MaNguon)
        {
            string icon = "";
            switch (MaNguon)
            {
                case "1": icon = "record_voice_over"; break;
                case "2": icon = "bookmark_border"; break;
                case "3": icon = "fiber_new"; break;
                case "4": icon = "help"; break;
                case "5": icon = "live_tv"; break;
                case "6": icon = "language"; break;
                default: icon = "language"; break;
            }
            return icon;
        }

        //1. lấy năm tuyển sinh
        [HttpGet]
        public JsonResult GetNamTuyenSinh()
        {
            var lstNamTuyenSinh = db.sp_dim_namtuyensinh_select_all().OrderByDescending(x => x.Nam).Select(x => new YearDTO()
            {
                Year = x.TenNam,
                isSelected = int.Parse(x.TenNam) == (DateTime.Now.Year - 1) ? true : false
            }).Take(3).ToList();
            ViewBag.ListNamTuyenSinh = lstNamTuyenSinh;
            return Json(lstNamTuyenSinh, JsonRequestBehavior.AllowGet);
        }

        //2. lấy cơ sở
        [HttpGet]
        public JsonResult GetCoSo()
        {
            var lstCoSo = db.sp_dim_coso_select_all().Select(x => new CoSoDTO()
            {
                MaCoSo = x.MaCoSo,
                TenCoSo = x.TenCoSo,
                isSelected = false
            }).ToList();
            lstCoSo.Add(new CoSoDTO { MaCoSo = "all", TenCoSo = "Tất cả", isSelected = true });
            ViewBag.ListCoSo = lstCoSo;
            return Json(lstCoSo, JsonRequestBehavior.AllowGet);
        }

        //3. khu vực
        [HttpGet]
        public JsonResult GetKhuVuc()
        {
            var lstKhuVuc = db.sp_dim_khuvuc_select_all().Select(x => new KhuVucDTO()
            {
                MaKhuVuc = x.MaKhuVuc,
                TenKhuVuc = x.TenKhuVuc,
                isSelected = false
            }).ToList();
            lstKhuVuc.Add(new KhuVucDTO { MaKhuVuc = "all", TenKhuVuc = "Tất cả", isSelected = true });
            ViewBag.ListKhuVuc = lstKhuVuc;
            return Json(lstKhuVuc, JsonRequestBehavior.AllowGet);
        }

        //4. lấy ngành
        [HttpGet]
        public JsonResult GetNganh()
        {
            var lstNganh = db.sp_dim_nganh_select_all().Select(x => new NganhDTO()
            {
                MaNganh = x.MaNganh,
                TenNganh = x.TenNganh,
                isSelected = false
            }).ToList();
            lstNganh.Add(new NganhDTO { MaNganh = "all", TenNganh = "Tất cả", isSelected = true });
            ViewBag.ListNganh = lstNganh;
            return Json(lstNganh, JsonRequestBehavior.AllowGet);
        }

        //5. lấy hình thức tuyển sinh
        [HttpGet]
        public JsonResult GetHinhThucTuyenSinh()
        {
            var lstHinhThucTuyenSinh = db.sp_dim_hinhthuctuyensinh_select_all().Select(x => new HinhThucTuyenSinhDTO()
            {
                MaHinhThucTuyenSinh = x.MaHinhThuc.ToString(),
                TenHinhThucTuyenSinh = x.TenHinhThuc,
                isSelected = false
            }).ToList();
            lstHinhThucTuyenSinh.Add(new HinhThucTuyenSinhDTO { MaHinhThucTuyenSinh = "all", TenHinhThucTuyenSinh = "Tất cả", isSelected = true });
            ViewBag.ListHinhThucXetTuyen = lstHinhThucTuyenSinh;
            return Json(lstHinhThucTuyenSinh, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult GetDataForChartAndGrid(string Loai, List<string> lstYear, string TypeChart, string MaHinhThuc, string MaCoSo, List<string> lstMaNganh, string MaKhuVuc)
        {
            List<DataForChartDTO> result = new List<DataForChartDTO>();
            List<DataForPieChartDTO> resultPieChart = new List<DataForPieChartDTO>();
            List<DataForGridDTO> dataForGrid = new List<DataForGridDTO>();
            List<string> lstColor = new List<string>(new string[] { "#ffa534", "#23ccef", "#fb404b" });
            List<string> lstLoai = new List<string>(new string[] { "DK", "NH" });
            double TotalNumber = 0;
            int indexColor = 0;
            int index = 1;

            //kiểm tra dữ liệu truyền vào
            if (MaCoSo == "all")
                MaCoSo = null;
            if (MaHinhThuc == "all")
                MaHinhThuc = null;
            if (MaKhuVuc == "all")
                MaKhuVuc = null;

            //lấy danh sách ngành (cột Ox)
            GetNganhForChart(lstMaNganh);

            foreach (var year in lstYear)
            {
                if (TypeChart == "soluong")
                {
                    //1. trường hợp chọn 1 năm -> đăng ký/nhập học = all
                    if (Loai == "all")
                    {
                        foreach (var loai in lstLoai)
                        {
                            DataForChartDTO chartDTO = new DataForChartDTO();
                            chartDTO.name = loai == "DK" ? "Đăng ký" : "Nhập học";
                            chartDTO.color = lstColor[indexColor++];

                            List<int?> lstPoint = new List<int?>();
                            foreach (var nganh in lstNganhDTO)
                            {
                                int? soLuong = 0;
                                if (loai == "DK")
                                    soLuong = db.sp_fact_dangky_filter(int.Parse(year), MaHinhThuc, MaCoSo, nganh.MaNganh, MaKhuVuc).Sum(x => x.TongSo);
                                else
                                    soLuong = db.sp_fact_nhaphoc_filter(int.Parse(year), MaHinhThuc, MaCoSo, nganh.MaNganh, MaKhuVuc).Sum(x => x.TongSo);
                                lstPoint.Add(soLuong);
                                //lấy tổng số lượng sinh viên đăng ký/nhập học
                                TotalNumber += double.Parse(soLuong.ToString());
                                //add data cho grid
                                DataForGridDTO gridDTO = new DataForGridDTO();
                                gridDTO.STT = index++;
                                gridDTO.Nganh = nganh.TenNganh;
                                gridDTO.Nam = year.ToString();
                                gridDTO.Loai = loai == "DK" ? "Đăng ký" : "Nhập học";
                                gridDTO.KhuVuc = MaKhuVuc == null ? "Tất cả" : db.sp_dim_khuvuc_select_all().Where(x => x.MaKhuVuc == MaKhuVuc).FirstOrDefault().TenKhuVuc;
                                gridDTO.HinhThucTuyenSinh = MaHinhThuc == null ? "Tất cả hình thức tuyển sinh" : db.sp_dim_hinhthuctuyensinh_select_all().Where(x => x.MaHinhThuc.ToString() == MaHinhThuc).FirstOrDefault().TenHinhThuc;
                                gridDTO.CoSo = MaCoSo == null ? "Tất cả cơ sở" : db.sp_dim_coso_select_all().Where(x => x.MaCoSo == MaCoSo).FirstOrDefault().TenCoSo;
                                gridDTO.SoLuong = int.Parse(soLuong.ToString());
                                dataForGrid.Add(gridDTO);
                            }
                            chartDTO.data = lstPoint;
                            result.Add(chartDTO);
                        }
                    }
                    //2. trường hợp chọn nhiều năm
                    else
                    {
                        DataForChartDTO chartDTO = new DataForChartDTO();
                        chartDTO.name = year;
                        chartDTO.color = lstColor[indexColor++];

                        List<int?> lstPoint = new List<int?>();
                        foreach (var nganh in lstNganhDTO)
                        {
                            int? soLuong = 0;
                            if (Loai == "DK")
                                soLuong = db.sp_fact_dangky_filter(int.Parse(year), MaHinhThuc, MaCoSo, nganh.MaNganh, MaKhuVuc).Sum(x => x.TongSo);
                            else
                                soLuong = db.sp_fact_nhaphoc_filter(int.Parse(year), MaHinhThuc, MaCoSo, nganh.MaNganh, MaKhuVuc).Sum(x => x.TongSo);
                            lstPoint.Add(soLuong);
                            //add data cho grid
                            DataForGridDTO gridDTO = new DataForGridDTO();
                            gridDTO.STT = index++;
                            gridDTO.Nganh = nganh.TenNganh;
                            gridDTO.Nam = year.ToString();
                            gridDTO.Loai = Loai == "DK" ? "Đăng ký" : "Nhập học";
                            gridDTO.KhuVuc = MaKhuVuc == null ? "Tất cả" : db.sp_dim_khuvuc_select_all().Where(x => x.MaKhuVuc == MaKhuVuc).FirstOrDefault().TenKhuVuc;
                            gridDTO.HinhThucTuyenSinh = MaHinhThuc == null ? "Tất cả hình thức tuyển sinh" : db.sp_dim_hinhthuctuyensinh_select_all().Where(x => x.MaHinhThuc.ToString() == MaHinhThuc).FirstOrDefault().TenHinhThuc;
                            gridDTO.CoSo = MaCoSo == null ? "Tất cả cơ sở" : db.sp_dim_coso_select_all().Where(x => x.MaCoSo == MaCoSo).FirstOrDefault().TenCoSo;
                            gridDTO.SoLuong = int.Parse(soLuong.ToString());
                            dataForGrid.Add(gridDTO);
                        }
                        chartDTO.data = lstPoint;
                        result.Add(chartDTO);
                    }
                }
                //vẽ pie chart
                else
                {
                    index = 0;
                    indexColor = 0;
                    foreach (var nganh in lstNganhDTO)
                    {
                        DataForPieChartDTO dto = new DataForPieChartDTO();
                        dto.category = nganh.TenNganh;
                        dto.color = ArrColor[indexColor++];

                        int? soLuong = 0;
                        if (Loai == "DK")
                            soLuong = db.sp_fact_dangky_filter(int.Parse(year), MaHinhThuc, MaCoSo, nganh.MaNganh, MaKhuVuc).Sum(x => x.TongSo);
                        else
                            soLuong = db.sp_fact_nhaphoc_filter(int.Parse(year), MaHinhThuc, MaCoSo, nganh.MaNganh, MaKhuVuc).Sum(x => x.TongSo);
                        dto.value = float.Parse(soLuong.ToString());
                        TotalNumber += double.Parse(soLuong.ToString());

                        DataForGridDTO gridDTO = new DataForGridDTO();
                        gridDTO.STT = index++;
                        gridDTO.Nganh = nganh.TenNganh;
                        gridDTO.Nam = year.ToString();
                        gridDTO.Loai = Loai == "DK" ? "Đăng ký" : "Nhập học";
                        gridDTO.KhuVuc = MaKhuVuc == null ? "Tất cả" : db.sp_dim_khuvuc_select_all().Where(x => x.MaKhuVuc == MaKhuVuc).FirstOrDefault().TenKhuVuc;
                        gridDTO.HinhThucTuyenSinh = MaHinhThuc == null ? "Tất cả hình thức tuyển sinh" : db.sp_dim_hinhthuctuyensinh_select_all().Where(x => x.MaHinhThuc.ToString() == MaHinhThuc).FirstOrDefault().TenHinhThuc;
                        gridDTO.CoSo = MaCoSo == null ? "Tất cả cơ sở" : db.sp_dim_coso_select_all().Where(x => x.MaCoSo == MaCoSo).FirstOrDefault().TenCoSo;
                        gridDTO.SoLuong = int.Parse(soLuong.ToString());
                        dataForGrid.Add(gridDTO);

                        resultPieChart.Add(dto);
                    }

                    int indexTemp = 0;
                    float TotalPercent = 0;
                    foreach (var nganh in resultPieChart)
                    {
                        if (nganh.value != 0 && indexTemp != resultPieChart.Count() - 1)
                        {
                            nganh.value = float.Parse(Math.Round((100 * nganh.value) / TotalNumber, 1).ToString());
                            TotalPercent += float.Parse(Math.Round(nganh.value, 1).ToString());
                        }
                        else if (nganh.value != 0)
                            nganh.value = float.Parse(Math.Round(100 - TotalPercent, 1).ToString());
                        indexTemp++;
                    }
                    return Json(new { resultPieChart, dataForGrid }, JsonRequestBehavior.AllowGet);
                }
            }
            var ArrNganh = lstNganhDTO.Select(x => x.TenNganh).ToArray();
            return Json(new { result, ArrNganh, dataForGrid }, JsonRequestBehavior.AllowGet);
        }

        public void GetNganhForChart(List<string> lstMaNganh)
        {
            //kiểm tra trường hợp chọn nhiều ngành
            //1. chọn tất cả các ngành
            if (lstMaNganh.Count() == 1 && lstMaNganh[0] == "all")
            {
                lstNganhDTO = db.sp_dim_nganh_select_all().Select(x => new NganhDTO()
                {
                    MaNganh = x.MaNganh,
                    TenNganh = x.TenNganh
                }).ToList();
            }

            //2. chọn 1 - 3 ngành
            else
            {
                List<string> lstTenNganh = new List<string>();
                foreach (var maNganh in lstMaNganh)
                {
                    NganhDTO item = db.sp_dim_nganh_select_all().ToList()
                        .Where(x => x.MaNganh.ToString() == maNganh).Select(x => new NganhDTO()
                        {
                            TenNganh = x.TenNganh,
                            MaNganh = x.MaNganh.ToString()
                        }).First();
                    lstNganhDTO.Add(item);
                }
            }
        } //có được danh sách ngành cho hàng ngang (Ox)
    }
}