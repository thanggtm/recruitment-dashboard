var typeChart = 'column';

$("select").select2({
    width: '100%',
});
$('#select2Truong').on('select2:select', function (e) {
    var data = e.params.data;
    if (data.id == "all") {
        $('#select2Truong').val("all").change();
    }
});
$('#selectNganh').on('select2:select', function (e) {
    var data = e.params.data;
    if (data.id == "all") {
        $('#selectNganh').val("all").change();
    }
});

$(document).ready(function () {
    $(window).on("resize", function () {
        kendo.resize($(".chart-wrapper"));
    });
    $('#select2Tinh').select2({
        maximumSelectionLength: 3,
        language: {
            maximumSelected: function (e) {
                var t = "Bạn chỉ có thể chọn tối đa " + e.maximum + " tỉnh";
                return t;
            }
        }
    });
    $('#select2Huyen').select2({
        maximumSelectionLength: 3,
        language: {
            maximumSelected: function (e) {
                var t = "Bạn chỉ có thể chọn tối đa " + e.maximum + " huyện";
                return t;
            }
        }
    });
    $('#selectNganh').select2({
        maximumSelectionLength: 3,
        language: {
            maximumSelected: function (e) {
                var t = "Bạn chỉ có thể chọn tối đa " + e.maximum + " ngành";
                return t;
            }
        }
    });
    $('#select2Truong').select2({
        maximumSelectionLength: 3,
        language: {
            maximumSelected: function (e) {
                var t = "Bạn chỉ có thể chọn tối đa " + e.maximum + " trường";
                return t;
            }
        }
    });
    $('#selectKhoa').select2();
    $('#select2Huyen').prop('disabled', false);
    $('#select2Truong').prop('disabled', 'disabled');
    prepareDataForChart();
});

function prepareDataForChart() {
    kendo.ui.progress($("#container"), true);
    var GioiTinh = "";
    var LoaiSinhVien = "";
    var lstMaTinh = $('#select2Tinh').val();
    var MaHuyen = $('#select2Huyen').val();
    var lstMaNganh = $('#selectNganh').val();
    var lstMaTruong = $('#select2Truong').val();

    if ($('#gioiTinh').val() == "all")
        GioiTinh = "all";
    if ($('#gioiTinh').val() == "nam")
        GioiTinh = "Nam";
    if ($('#gioiTinh').val() == "nu")
        GioiTinh = "Nữ";
    if ($('#selectLoaiSV').val() == "CT")
        LoaiSinhVien = "Chính thức";
    if ($('#selectLoaiSV').val() == "DB")
        LoaiSinhVien = "Dự bị";

    $.ajax({
        url: RootUrl + 'NhapHoc/GetDataForChart',
        data: {
            Year: $('#yearNhapHoc').val(),
            LoaiHinhDaoTao: $('#loaiHinhDaoTao').val(),
            lstMaTinh: lstMaTinh,
            MaHuyen: MaHuyen,
            GioiTinh: GioiTinh,
            lstMaNganh: lstMaNganh,
            LoaiSinhVien: LoaiSinhVien,
            lstMaTruong: lstMaTruong
        },
        type: 'POST',
        success: function (data) {
            var series = [];
            $.each(data.result, function (index, value) {
                series = series.concat(value);
            });
            createChart(data, data.ArrNganh, series, $('#yearNhapHoc').val());
            CreateGrid(data.lstDataForGrid);
        },
        error: function (err) {
            console.log("Error in prepareDataForChart");
            console.log(err);
        }
    });
}

function SumPoint(data) {
    var sum = 0;
    for (var i = 0; i < data.length; i++) {
        sum += data[i];
    }
    return sum;
}

function SetLabelForChart(data) {
    var label2 = "";
    var lenTotal = 0;
    var lstTinh = $('#select2Tinh').val();
    var MaHuyen = $('#select2Huyen').val();
    var lstTruong = $('#select2Truong').val();

    if (MaHuyen == "all" && lstTruong[0] == "all")
        lenTotal = lstTinh.length;
    else if (MaHuyen != "all" && lstTruong[0] == "all")
        lenTotal = 1;
    else
        lenTotal = lstTruong.length;

    for (var i = 0; i < lenTotal; i++) {
        var sum = 0;
        if (MaHuyen == "all" && lstTruong[0] == "all") {
            if (i == 0) {
                sum = SumPoint(data.result[0].data);
                label2 += $('#select2Tinh').select2('data')[0].text + " ( " + sum + " SV)"
            }
            if (i != 0) {
                sum = SumPoint(data.result[i].data);
                label2 += " - " + $('#select2Tinh').select2('data')[i].text + " ( " + sum + " SV)"
            }
        }
        else if (MaHuyen != "all" && lstTruong[0] == "all") {
            sum = SumPoint(data.result[0].data);
            label2 += $('#select2Huyen').select2('data')[0].text + " ( " + sum + " SV)"
        }
        else {
            if (i == 0) {
                sum = SumPoint(data.result[0].data);
                label2 += $('#select2Truong').select2('data')[0].text + " ( " + sum + " SV)"
            }
            if (i != 0) {
                sum = SumPoint(data.result[i].data);
                label2 += " - " + $('#select2Truong').select2('data')[i].text + " ( " + sum + " SV)"
            }
        }
    }
    return label2;
}

function createChart(data, lstNganh, series, year) {
    var temp = SetLabelForChart(data);
    var label = "Biểu đồ Thống kê Số lượng Nhập học Năm " + year + "\n";
    label += temp;
    kendo.ui.progress($("#container"), false);
    $("#chart").kendoChart({
        title: {
            text: label,
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
            template: "#= series.name # năm " + year + " - #= kendo.toString(category) # : #= value # sinh viên"
        }
    });
}

function Select2TinhOnChange() {
    var lstTinh = $('#select2Tinh').val();
    if (lstTinh.length == 1) {
        $('#select2Huyen').val("all").change();
        $('#select2Huyen').prop('disabled', false);
        $('#select2Truong').prop('disabled', 'disabled');
        prepareDataForSelect2Huyen();
    }
    if (lstTinh.length >= 2) {
        $('#select2Huyen').val("all").change();
        $('#select2Huyen').prop('disabled', 'disabled');
        $('#select2Truong').prop('disabled', 'disabled');
    }
}

function prepareDataForSelect2Huyen() {
    $.ajax({
        url: RootUrl + 'NhapHoc/GetHuyenByMaTinh?lstMaTinh=' + $('#select2Tinh').val(),
        dataType: "json",
        type: 'GET',
        processData: false,
        contentType: false,
        success: function (data) {
            var temp = JSON.stringify(data);
            data = JSON.parse(temp);
            SetDataForSelect2Huyen(data);
        },
        error: function (err) {
            console.log("Error in prepareDataForSelect2Huyen");
            console.log(err);
        }
    });
}

function SetDataForSelect2Huyen(data) {
    var id = $('#select2Huyen');
    id.empty();

    var option = document.createElement("option");
    option.text = "Tất cả";
    option.value = "all";
    option.selected = "selected";
    id.append(option);

    for (var i = 0; i < data.length; i++) {
        var option = document.createElement("option");
        option.text = data[i].TenHuyen;
        option.value = data[i].MaHuyen;
        id.append(option);
    }
}

function Select2HuyenOnChange() {
    var MaHuyen = $('#select2Huyen').val();
    var lstTinh = $('#select2Tinh').val();
    if (MaHuyen == "all") {
        $('#select2Truong').val("all").change();
        $('#select2Truong').prop('disabled', 'disabled');
    }
    else {
        GetTruongByHuyen();
        $('#select2Truong').prop('disabled', false);
    }
    prepareDataForChart();
}

function SelectNganhOnChange() {
    var lstNganh = $('#selectNganh').val();
    if (lstNganh.length > 1) {
        var itemtoRemove = "all";
        var index = lstNganh.indexOf(itemtoRemove);
        if (index != -1) {
            lstNganh.splice($.inArray(itemtoRemove, lstNganh), 1);
            $('#selectNganh').select2("val", lstNganh);
        }
    }
    if (lstNganh.length > 0)
        prepareDataForChart();
}

function LoaiHinhDaoTaoOnChange() {
    prepareDataForChart();
}

function SelectGioiTinhOnChange() {
    prepareDataForChart();
}

function SelectNamOnChange() {
    prepareDataForChart();
}

function SelectLoaiSVOnChange() {
    prepareDataForChart();
}

function SelectKhoaOnChange() {
    GetNganhByKhoa();
}

function defineLineChart() {
    typeChart = "line";
    prepareDataForChart();
}

function defineBarChart() {
    typeChart = "column";
    prepareDataForChart();
}

function defineAreaChart() {
    typeChart = "area";
    prepareDataForChart();
}

function SetNganhForSelect2Nganh(data) {
    var id = $('#selectNganh');
    id.empty();

    if (($('#selectKhoa').val() == "all")) {
        var option = document.createElement("option");
        option.text = "Tất cả";
        option.value = "all";
        option.selected = true;
        id.append(option);

        for (var i = 0; i < data.length; i++) {
            var option = document.createElement("option");
            option.text = data[i].TenNganh;
            option.value = data[i].MaNganh;
            id.append(option);
        }
    }

    else {
        for (var i = 0; i < data.length; i++) {
            var option = document.createElement("option");
            option.text = data[i].TenNganh;
            option.value = data[i].MaNganh;
            if (i == 0)
                option.selected = true;
            id.append(option);
        }
    }
    prepareDataForChart();
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
                        HeDaoTao: {
                            type: "string"
                        },
                        Tinh: {
                            type: "string"
                        },
                        Huyen: {
                            type: "string"
                        },
                        Truong: {
                            type: "string"
                        },
                        GioiTinh: {
                            type: "string"
                        },
                        Nganh: {
                            type: "string"
                        },
                        LoaiSinhVien: {
                            type: "string"
                        },
                        SoLuongNhapHoc: {
                            type: "number"
                        },
                    }
                }
            },
            pageSize: 20,
        },
        height: 550,
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
                field: "HeDaoTao",
                width: 170,
                headerAttributes: {
                    style: "text-align: center"
                },
                title: "Hệ đào tạo",
            },
            {
                field: "Tinh",
                width: 120,
                headerAttributes: {
                    style: "text-align: center"
                },
                title: "Tỉnh",
            },
            {
                field: "Huyen",
                width: 150,
                headerAttributes: {
                    style: "text-align: center"
                },
                title: "Huyện",
            },
            {
                field: "Truong",
                width: 150,
                headerAttributes: {
                    style: "text-align: center"
                },
                title: "Trường",
            },
            {
                field: "GioiTinh",
                width: 120,
                headerAttributes: {
                    style: "text-align: center"
                },
                title: "Giới tính",
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
                field: "LoaiSinhVien",
                width: 150,
                headerAttributes: {
                    style: "text-align: center"
                },
                title: "Loại sinh viên",
            },
            {
                field: "SoLuongNhapHoc",
                width: 150,
                headerAttributes: {
                    style: "text-align: center"
                },
                title: "Số lượng nhập học",
            },
        ]
    });
}

function GetNganhByKhoa() {
    $.ajax({
        url: RootUrl + 'NhapHoc/GetNganhByKhoa?MaKhoa=' + $('#selectKhoa').val(),
        dataType: "json",
        type: 'GET',
        processData: false,
        contentType: false,
        success: function (data) {
            var temp = JSON.stringify(data);
            data = JSON.parse(temp);
            SetNganhForSelect2Nganh(data);
        },
        error: function (err) {
            console.log("Error in GetNganhByKhoa");
            console.log(err);
        }
    });
}

function GetTruongByHuyen() {
    var lstHuyen = $('#select2Huyen').val();
    var maTinh = $('#select2Tinh').val()[0];
    $.ajax({
        url: RootUrl + 'NhapHoc/GetTruongByHuyen',
        data: {
            maTinh: maTinh,
            lstMaHuyen: lstHuyen,
        },
        dataType: "json",
        type: 'POST',
        success: function (data) {
            var temp = JSON.stringify(data);
            data = JSON.parse(temp);
            SetTruongForSelect2Truong(data);
        },
        error: function (err) {
            console.log("Error in GetTruongByHuyen");
            console.log(err);
        }
    });
}

function SetTruongForSelect2Truong(data) {
    var id = $('#select2Truong');
    id.empty();

    var option = document.createElement("option");
    option.text = "Tất cả";
    option.value = "all";
    option.selected = true;
    id.append(option);

    for (var i = 0; i < data.length; i++) {
        var option = document.createElement("option");
        option.text = data[i].TenTruong;
        option.value = data[i].MaTruong;
        id.append(option);
    }
}

function Select2TruongOnChange() {
    var lstTruong = $('#select2Truong').val();
    var lstTinh = $('#select2Tinh').val();
    var MaHuyen = $('#select2Huyen').val();

    if (lstTruong.length > 1) {
        var itemtoRemove = "all";
        var index = lstTruong.indexOf(itemtoRemove);
        if (index != -1) {
            lstTruong.splice($.inArray(itemtoRemove, lstTruong), 1);
            $("#select2Truong").select2("val", lstTruong);
        }    
    }
    if (lstTruong.length > 0 && lstTinh.length == 1 && MaHuyen != "all")
        prepareDataForChart();
}