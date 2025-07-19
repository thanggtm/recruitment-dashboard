var typeChart = "column";
var typeChartNTC = "column";

$(document).ready(function () {
    $('#typeChart').show();
    $('#typeChartNTC').show();

    $(window).on("resize", function () {
        kendo.resize($(".chart-wrapper"));
    });

    $('#select2YearTK').select2({
        maximumSelectionLength: 3,
        language: {
            maximumSelected: function (e) {
                var t = "Bạn chỉ có thể chọn tối đa " + e.maximum + " năm";
                return t;
            }
        }
    });

    $('#select2Year').select2({
        maximumSelectionLength: 3,
        language: {
            maximumSelected: function (e) {
                var t = "Bạn chỉ có thể chọn tối đa " + e.maximum + " năm";
                return t;
            }
        }
    });

    $('#select2Nganh').select2({
        maximumSelectionLength: 3,
        language: {
            maximumSelected: function (e) {
                var t = "Bạn chỉ có thể chọn tối đa " + e.maximum + " ngành";
                return t;
            }
        }
    });

    GetDataNguonTiepCan();
    GetDataForChartAndGrid();
});

function GetDataNguonTiepCan() {
    var lstYear = $('#select2Year').val();
    var TypeChart = $('#select2LoaiBieuDoNTC').val();
    var MaKhuVuc = $('#select2KhuVuc').val();

    $.ajax({
        url: RootUrl + 'Dashboard/GetDataNguonTiepCan',
        data: {
            lstYear: lstYear,
            TypeChart: TypeChart,
            MaKhuVuc: MaKhuVuc
        },
        type: 'POST',
        success: function (data) {
            if (TypeChart == "soluong") {
                var series = [];
                $.each(data.result, function (index, value) {
                    series = series.concat(value);
                });
                CreateChartNTC(data, data.ArrNguonTiepCan, series);
                CreateGridNTC(data.dataForGrid);
            }
            else {
                var dataPieChart = [];
                $.each(data.resultPieChart, function (index, value) {
                    dataPieChart = dataPieChart.concat(value);
                });
                CreatePieChartNTC(dataPieChart);
                CreateGridNTC(data.dataForGrid);
            }
        },
        error: function (err) {
            console.log("Error in GetDataNguonTiepCan");
            console.log(err);
        }
    });
}

function CreatePieChartNTC(data) {
    $("#chartNTC").kendoChart({
        title: {
            position: "bottom",
        },
        legend: {
            visible: false
        },
        chartArea: {
            background: ""
        },
        seriesDefaults: {
            labels: {
                visible: true,
                background: "transparent",
                template: "#= category #: \n #= value#%",
                font: "12pt 'Helvetica Neue', Helvetica, Arial, sans-serif",
            }
        },
        series: [{
            type: "pie",
            startAngle: 150,
            padding: 30,
            data: data
        }],
        tooltip: {
            visible: true,
            format: "{0}%"
        }
    });
}

function CreateChartNTC(data, lstNguonTiepCan, series) {
    kendo.ui.progress($("#container"), false);
    $("#chartNTC").kendoChart({
        title: {
            text: data.label,
            font: "16pt 'Helvetica Neue', Helvetica, Arial, sans-serif",
            color: "#07001a",
        },
        legend: {
            position: "bottom"
        },
        chartArea: {
            background: "white",
            height: 600
        },
        seriesDefaults: {
            type: typeChartNTC,
            style: "smooth"
        },
        series: series,
        valueAxis: {
            labels: {
                format: "{0}"
            },
            line: {
                visible: false
            },
            axisCrossingValue: 0
        },
        categoryAxis: {
            categories: lstNguonTiepCan,
            majorGridLines: {
                visible: false
            },
            labels: {
                rotation: "auto"
            }
        },
        tooltip: {
            visible: true,
            format: "{0}",
            template: "#= kendo.toString(category) # (#= series.name #): #= value #"
        }
    });
}

function CreateGridNTC(data) {
    $("#gridNTC").kendoGrid({
        dataSource: {
            data: data,
            schema: {
                model: {
                    fields: {
                        STT: {
                            type: "number"
                        },
                        Year: {
                            type: "string"
                        },
                        KhuVuc: {
                            type: "string"
                        },
                        TenNguonTiepCan: {
                            type: "string"
                        },
                        SoLuong: {
                            type: "number"
                        },
                    }
                }
            },
            pageSize: 20,
        },
        height: 250,
        filterable: {
            mode: "row",
            operators: {
                string: {
                    eq: "Bằng ký tự nhập vào",
                    neq: "Khác ký tự nhập vào",
                    startswith: "Bắt đầu với ký tự",
                    contains: "Có chứa ký tự",
                    endswith: "Kết thúc với ký tự"
                },
                //filter menu for "number" type columns
                number: {
                    eq: "Bằng",
                    neq: "Không bằng",
                    gte: "Lớn hơn hoặc bằng",
                    gt: "Lớn hơn",
                    lte: "Nhỏ hơn hoặc bằng",
                    lt: "Nhỏ hơn"
                },
            }
        },
        pageable: {
            refresh: true,
            pageSizes: true,
            buttonCount: 5,
            messages: {
                display: "{0} - {1} trên {2} dữ liệu", //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
                empty: "Không có dữ liệu hiển thị",
                page: "Trang",
                allPages: "Tất cả",
                of: "of {0}", //{0} is total amount of pages
                itemsPerPage: "dòng mỗi trang",
                first: "Đi đến trang đầu tiên",
                previous: "Trang trước",
                next: "Trang tiếp theo",
                last: "Đi đến trang cuối cùng",
                refresh: "Làm mới"
            }
        },
        columns: [
            {
                field: "STT",
                width: 50,
                title: "STT",
                headerAttributes: {
                    style: "text-align: center"
                },
                filterable: false
            },
            {
                field: "Year",
                width: 70,
                headerAttributes: {
                    style: "text-align: center"
                },
                title: "Năm",
            },
            {
                field: "KhuVuc",
                width: 120,
                headerAttributes: {
                    style: "text-align: center"
                },
                title: "Khu vực",
            },
            {
                field: "TenNguonTiepCan",
                width: 150,
                headerAttributes: {
                    style: "text-align: center"
                },
                title: "Nguồn tiếp cận",
            },
            {
                field: "SoLuong",
                width: 120,
                headerAttributes: {
                    style: "text-align: center"
                },
                title: "Số lượng",
            }
        ]
    });
}

function Select2YearOnChange() {
    var lstYear = $('#select2Year').val();
    if (lstYear.length > 1) {
        $('#select2LoaiBieuDoNTC').prop('disabled', 'disabled');
        $('#select2LoaiBieuDoNTC').val("soluong");
    }
    else if (lstYear.length == 1) {
        $('#select2LoaiBieuDoNTC').prop('disabled', false);
    }
    if (lstYear.length > 0)
        GetDataNguonTiepCan();
}

function Select2KhuVucOnChange() {
    GetDataNguonTiepCan();
}

function GetDataForChartAndGrid() {
    kendo.ui.progress($("#container"), true);

    var Loai = $('#select2DKNH').val();
    var lstYear = $('#select2YearTK').val();
    var TypeChart = $('#select2LoaiBieuDo').val();
    var MaHinhThuc = $('#select2HTTS').val();
    var MaCoSo = $('#select2CoSoTK').val();
    var lstMaNganh = $('#select2Nganh').val();
    var MaKhuVuc = $('#select2KhuVucTK').val();

    $.ajax({
        url: RootUrl + 'Dashboard/GetDataForChartAndGrid',
        data: {
            Loai: Loai,
            lstYear: lstYear,
            TypeChart: TypeChart,
            MaHinhThuc: MaHinhThuc,
            MaCoSo: MaCoSo,
            lstMaNganh: lstMaNganh,
            MaKhuVuc: MaKhuVuc
        },
        type: 'POST',
        success: function (data) {
            if (TypeChart == "soluong") {
                var series = [];
                $.each(data.result, function (index, value) {
                    series = series.concat(value);
                });
                CreateChart(data, data.ArrNganh, series);
                CreateGrid(data.dataForGrid);
            }
            else {
                var dataPieChart = [];
                $.each(data.resultPieChart, function (index, value) {
                    dataPieChart = dataPieChart.concat(value);
                });
                CreatePieChartThongKe(dataPieChart);
                CreateGrid(data.dataForGrid);
            }
        },
        error: function (err) {
            console.log("Error in GetDataForChartAndGrid");
            console.log(err);
        }
    });
}

function CreatePieChartThongKe(data) {
    $("#chart").kendoChart({
        legend: {
            visible: false
        },
        chartArea: {
            background: ""
        },
        seriesDefaults: {
            labels: {
                visible: true,
                background: "transparent",
                template: "#= category #: \n #= value#%",
                font: "12pt 'Helvetica Neue', Helvetica, Arial, sans-serif",
            }
        },
        series: [{
            type: "pie",
            startAngle: 150,
            data: data
        }],
        tooltip: {
            visible: true,
            format: "{0}%"
        }
    });
}

function CreateLabel(data) {
    var label = "Biểu đồ Thống kê Tuyển sinh";
    var MaLoai = $('#select2DKNH').val();
    var MaCoSo = $('#select2CoSoTK').val();
    var MaKhuVuc = $('#select2KhuVucTK').val();
    var MaHTTS = $('#select2HTTS').val();
    var lstYear = $('#select2YearTK').val();

    if (MaCoSo != "all")
        label += " tại Cơ sở " + $('#select2CoSoTK option:selected').text();

    if (MaKhuVuc != "all")
        label += " Khu vực " + $('#select2KhuVucTK option:selected').text();

    if (MaHTTS != "all")
        label += "\nTheo Hình thức Tuyển sinh " + $('#select2HTTS option:selected').text();

    if (MaLoai == "all") {
        label += "\nĐăng ký (" + SumPoint(data, 0) + " SV)";
        label += " và Nhập học (" + SumPoint(data, 1) + " SV)";
    }
    else if (MaLoai != "all" && lstYear.length == 1)
        label += MaLoai == "DK" ? "\nĐăng ký (" + SumPoint(data, 0) + " SV) năm " + lstYear[0] : "\nNhập học (" + SumPoint(data, 1) + " SV) năm " + lstYear[0];
    else if (MaLoai != "all" && lstYear.length > 1) {
        label += "\nTheo các Năm";
        for (var i = 0; i < lstYear.length; i++) {
            label += " - " + lstYear[i] + " (" + SumPoint(data, i) + " SV)";
        }
    }
    return label;
}

function SumPoint(data, index) {
    var sum = 0;
    var length = data.result[index].data.length;
    for (var i = 0; i < length; i++) {
        sum += data.result[index].data[i];
    }
    return sum;
}

function CreateChart(data, lstNganh, series) {
    kendo.ui.progress($("#container"), false);
    $("#chart").kendoChart({
        title: {
            text: CreateLabel(data),
            font: "16pt 'Helvetica Neue', Helvetica, Arial, sans-serif",
            color: "#07001a",
        },
        legend: {
            position: "bottom"
        },
        chartArea: {
            background: "white",
            height: 600
        },
        seriesDefaults: {
            type: typeChart,
            style: "smooth"
        },
        series: series,
        valueAxis: {
            labels: {
                format: "{0} sinh viên"
            },
            line: {
                visible: false
            },
            axisCrossingValue: 0
        },
        categoryAxis: {
            categories: lstNganh,
            majorGridLines: {
                visible: false
            },
            labels: {
                rotation: "auto"
            }
        },
        tooltip: {
            visible: true,
            format: "{0}",
            template: "#= kendo.toString(category) # (#= series.name #): #= value # sinh viên"
        }
    });
}

function CreateGrid(data) {
    $("#grid").kendoGrid({
        dataSource: {
            data: data,
            schema: {
                model: {
                    fields: {
                        STT: {
                            type: "number"
                        },
                        Nam: {
                            type: "string"
                        },
                        Loai: {
                            type: "string"
                        },
                        CoSo: {
                            type: "string"
                        },
                        KhuVuc: {
                            type: "string"
                        },
                        Nganh: {
                            type: "string"
                        },
                        HinhThucTuyenSinh: {
                            type: "string"
                        },
                        SoLuong: {
                            type: "number"
                        }
                    }
                }
            },
            pageSize: 20,
        },
        height: 250,
        filterable: {
            mode: "row",
            operators: {
                string: {
                    eq: "Bằng ký tự nhập vào",
                    neq: "Khác ký tự nhập vào",
                    startswith: "Bắt đầu với ký tự",
                    contains: "Có chứa ký tự",
                    endswith: "Kết thúc với ký tự"
                },
                //filter menu for "number" type columns
                number: {
                    eq: "Bằng",
                    neq: "Không bằng",
                    gte: "Lớn hơn hoặc bằng",
                    gt: "Lớn hơn",
                    lte: "Nhỏ hơn hoặc bằng",
                    lt: "Nhỏ hơn"
                },
            }
        },
        pageable: {
            refresh: true,
            pageSizes: true,
            buttonCount: 5,
            messages: {
                display: "{0} - {1} trên {2} dữ liệu", //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
                empty: "Không có dữ liệu hiển thị",
                page: "Trang",
                allPages: "Tất cả",
                of: "of {0}", //{0} is total amount of pages
                itemsPerPage: "dòng mỗi trang",
                first: "Đi đến trang đầu tiên",
                previous: "Trang trước",
                next: "Trang tiếp theo",
                last: "Đi đến trang cuối cùng",
                refresh: "Làm mới"
            }
        },
        columns: [
            {
                field: "STT",
                width: 50,
                title: "STT",
                headerAttributes: {
                    style: "text-align: center"
                },
                filterable: false
            },
            {
                field: "Nam",
                width: 120,
                headerAttributes: {
                    style: "text-align: center"
                },
                title: "Năm",
            },
            {
                field: "Loai",
                width: 120,
                headerAttributes: {
                    style: "text-align: center"
                },
                title: "Loại",
            },
            {
                field: "CoSo",
                width: 150,
                headerAttributes: {
                    style: "text-align: center"
                },
                title: "Cơ sở",
            },
            {
                field: "KhuVuc",
                width: 150,
                headerAttributes: {
                    style: "text-align: center"
                },
                title: "Khu vực",
            },
            {
                field: "Nganh",
                width: 200,
                headerAttributes: {
                    style: "text-align: center"
                },
                title: "Ngành",
            },
            {
                field: "HinhThucTuyenSinh",
                width: 200,
                headerAttributes: {
                    style: "text-align: center"
                },
                title: "Hình thức tuyển sinh",
            },
            {
                field: "SoLuong",
                width: 120,
                headerAttributes: {
                    style: "text-align: center"
                },
                title: "Số lượng",
            }
        ]
    });
}

//onchange event

function Select2YearTKOnChange() {
    var lstYear = $('#select2YearTK').val();
    //1. trường hợp chọn 1 năm
    if (lstYear.length == 1) {
        $('#select2LoaiBieuDo').prop('disabled', false);
        $('#select2DKNH').prop('disabled', 'disabled');
        $('#select2DKNH').find('option[value="all"]').attr("disabled", false);
        $('#select2DKNH').val("all");
        GetDataForChartAndGrid();
    }
    //2. trường hợp chọn nhiều năm
    else if (lstYear.length > 1) {
        $('#select2LoaiBieuDo').prop('disabled', 'disabled');
        $('#select2LoaiBieuDo').val("soluong");
        $('#select2DKNH').prop('disabled', false);
        $('#select2DKNH').val("DK");
        $('#select2DKNH').find('option[value="all"]').attr("disabled", "disabled");
        GetDataForChartAndGrid();
    }
}

function Select2DKNHOnChange() {
    GetDataForChartAndGrid();
}

function Select2CoSoTKOnChange() {
    GetDataForChartAndGrid();
}

function Select2KhuVucTKOnChange() {
    GetDataForChartAndGrid();
}

function SelectNganhOnChange() {
    GetDataForChartAndGrid();
}

function Select2HTTSOnChange() {
    GetDataForChartAndGrid();
}

function Select2LoaiBieuDoOnChange() {
    var loaiBieuDo = $("#select2LoaiBieuDo").val();

    if (loaiBieuDo == "phantram") {
        $('#typeChart').hide();
        $('#select2DKNH').prop('disabled', false);
        $('#select2DKNH').val("DK");
        $('#select2DKNH').find('option[value="all"]').attr("disabled", "disabled");
    }
    else {
        $('#typeChart').show();
        $('#select2DKNH').val("all");
        $('#select2DKNH').prop('disabled', 'disabled');
        $('#select2DKNH').find('option[value="all"]').attr("disabled", false);
    }
    GetDataForChartAndGrid();
}

function Select2LoaiBieuDoNTCOnChange() {
    var loaiBieuDo = $("#select2LoaiBieuDoNTC").val();

    if (loaiBieuDo == "phantram")
        $('#typeChartNTC').hide();
    else
        $('#typeChartNTC').show();
    GetDataNguonTiepCan();
}

//change type chart

function LineChart() {
    typeChart = "line";
    GetDataForChartAndGrid();
}

function ColumnChart() {
    typeChart = "column";
    GetDataForChartAndGrid();
}

function AreaChart() {
    typeChart = "area";
    GetDataForChartAndGrid();
}

function LineNTCChart() {
    typeChartNTC = "line";
    GetDataNguonTiepCan();
}

function ColumnNTCChart() {
    typeChartNTC = "column";
    GetDataNguonTiepCan();
}

function AreaNTCChart() {
    typeChartNTC = "area";
    GetDataNguonTiepCan();
}