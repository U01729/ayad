/**
 * ui.js - دوال للتحكم في واجهة المستخدم وتحديثها
 * 
 * تم فصلها من index.html لتحسين هيكل الكود وقابلية الصيانة
 * تم تحسين مؤشرات التقدم وترجمة النصوص
 */

// العناصر الشائعة الاستخدام
const msgsElement = document.getElementById("msgs");
const msgs2Element = document.getElementById("msgs2");
const menuElement = document.getElementById("menu");
const progressElement = document.getElementById("progress");

// وظيفة لتحديث رسالة التقدم الرئيسية
function updateProgress(message) {
    if (msgs2Element) {
        msgs2Element.innerHTML = message;
        console.log("Progress Update: " + message); // تسجيل في الكونسول للتصحيح
    }
}

// وظيفة لتحديث الرسالة العلوية (العنوان)
function updateMainMessage(message) {
    if (msgsElement) {
        msgsElement.innerHTML = message;
    }
}

// يتم استدعاؤها عند اكتمال عملية الجيلبريك بنجاح (قبل تحميل الـ payload)
function jbdone(){
    // updateProgress("تم الجيلبريك بنجاح! اختر Payload:"); // يمكن إزالة هذا السطر أو الإبقاء عليه حسب الرغبة
    // إخفاء عنصر التقدم
    if (progressElement) progressElement.style.display = "none";
    // إظهار قائمة الخيارات
    if (menuElement) menuElement.style.display = "block";
}

// يتم استدعاؤها عند تحميل الـ payload بنجاح
function allset(){
    // تحديث رسالة الواجهة لتعكس حالة التحميل الناجحة
    let finalMessage = "تم تحميل الـ Payload بنجاح"; // رسالة افتراضية مترجمة
    if (typeof LoadedMSG !== 'undefined') {
        finalMessage = LoadedMSG; // سيتم استخدام الرسالة المحددة في دوال التحميل
    }
    updateMainMessage(finalMessage); // تحديث الرسالة العلوية
    updateProgress("اكتمل التحميل بنجاح."); // تحديث رسالة التقدم
}

// وظيفة لمعالجة الأخطاء وعرضها للمستخدم
function showError(message) {
    updateProgress("<span style=\"color: red;\">خطأ: " + message + "</span>");
    console.error("Error: " + message); // تسجيل الخطأ في الكونسول
}

// وظيفة لتحميل ملف (مستخدمة لتحميل الـ payloads)
function loadFile(fileName) {
    updateProgress("جاري تحميل الملف: " + fileName + "...");
    try {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", fileName, false); 
        xhr.overrideMimeType("text/plain; charset=x-user-defined");
        xhr.send();

        if (xhr.status === 200 || xhr.status === 0) { 
            let array = Uint8Array.from(xhr.response, c => c.charCodeAt(0));
            if (fileName.endsWith(".bz2")) {
                updateProgress("جاري فك ضغط الملف: " + fileName + "...");
                PLS = bzip2.simple(bzip2.array(array)); 
                updateProgress("تم فك ضغط الملف بنجاح.");
            }
            updateProgress("تم تحميل الملف بنجاح: " + fileName);
            return array;
        } else {
            throw new Error("فشل تحميل الملف. الحالة: " + xhr.status);
        }
    } catch (error) {
        showError("فشل تحميل أو معالجة الملف " + fileName + ": " + error.message);
        throw error; 
    }
}

// وظيفة لتحميل وتشغيل GoldHEN v2.4b18.3
function load_goldhen23(){
    updateProgress("جاري بدء تحميل GoldHEN v2.4b18.3...");
    LoadedMSG = "تم تحميل GoldHEN v2.4b18.3"; // رسالة النجاح مترجمة
    PLfile = "goldhen.bin";
    load_poc(); 
}

// وظيفة load_poc - تم نقلها من index.html
function load_poc(){
 var req = new XMLHttpRequest();
 req.responseType = "arraybuffer";
 req.open('GET', PLfile);
 req.send();
 req.onreadystatechange = function () {
  if (req.readyState == 4) {
   PLD = req.response;
   var payload_buffer = chain.syscall(477, 0, PLD.byteLength*4 , 7, 0x1002, -1, 0);
   var pl = p.array_from_address(payload_buffer, PLD.byteLength*4);
   var padding = new Uint8Array(4 - (req.response.byteLength % 4) % 4);
   var tmp = new Uint8Array(req.response.byteLength + padding.byteLength);
   tmp.set(new Uint8Array(req.response), 0);
   tmp.set(padding, req.response.byteLength);
   var shellcode = new Uint32Array(tmp.buffer);
   pl.set(shellcode,0);
   var pthread = p.malloc(0x10);
   chain.call(libKernelBase.add32(OFFSET_lk_pthread_create), pthread, 0x0, payload_buffer, 0);
   allset();
  }
 };
}

// وظيفة لتحميل BinLoader
function load_binloader(){
    updateProgress("جاري بدء تحميل BinLoader...");
    try {
        var payload_buffer = chain.syscall(477, 0x0, 0x300000, 0x7, 0x1000, 0xFFFFFFFF, 0);
        var payload_loader = p.malloc32(0x1000);
        
        var loader_writer = payload_loader.backing;
        // ... (كود shellcode الخاص بـ BinLoader) ...
        loader_writer[0] = 0x56415741; loader_writer[1] = 0x83485541; loader_writer[2] = 0x894818EC; loader_writer[3] = 0xC748243C; loader_writer[4] = 0x10082444; loader_writer[5] = 0x483C2302; loader_writer[6] = 0x102444C7; loader_writer[7] = 0x00000000; loader_writer[8] = 0x000002BF; loader_writer[9] = 0x0001BE00; loader_writer[10] = 0xD2310000; loader_writer[11] = 0x00009CE8; loader_writer[12] = 0xC7894100; loader_writer[13] = 0x8D48C789; loader_writer[14] = 0xBA082474; loader_writer[15] = 0x00000010; loader_writer[16] = 0x000095E8; loader_writer[17] = 0xFF894400; loader_writer[18] = 0x000001BE; loader_writer[19] = 0x0095E800; loader_writer[20] = 0x89440000; loader_writer[21] = 0x31F631FF; loader_writer[22] = 0x0062E8D2; loader_writer[23] = 0x89410000; loader_writer[24] = 0x2C8B4CC6; loader_writer[25] = 0x45C64124; loader_writer[26] = 0x05EBC300; loader_writer[27] = 0x01499848; loader_writer[28] = 0xF78944C5; loader_writer[29] = 0xBAEE894C; loader_writer[30] = 0x00001000; loader_writer[31] = 0x000025E8; loader_writer[32] = 0x7FC08500; loader_writer[33] = 0xFF8944E7; loader_writer[34] = 0x000026E8; loader_writer[35] = 0xF7894400; loader_writer[36] = 0x00001EE8; loader_writer[37] = 0x2414FF00; loader_writer[38] = 0x18C48348; loader_writer[39] = 0x5E415D41; loader_writer[40] = 0x31485F41; loader_writer[41] = 0xC748C3C0; loader_writer[42] = 0x000003C0; loader_writer[43] = 0xCA894900; loader_writer[44] = 0x48C3050F; loader_writer[45] = 0x0006C0C7; loader_writer[46] = 0x89490000; loader_writer[47] = 0xC3050FCA; loader_writer[48] = 0x1EC0C748; loader_writer[49] = 0x49000000; loader_writer[50] = 0x050FCA89; loader_writer[51] = 0xC0C748C3; loader_writer[52] = 0x00000061; loader_writer[53] = 0x0FCA8949; loader_writer[54] = 0xC748C305; loader_writer[55] = 0x000068C0; loader_writer[56] = 0xCA894900; loader_writer[57] = 0x48C3050F; loader_writer[58] = 0x006AC0C7; loader_writer[59] = 0x89490000; loader_writer[60] = 0xC3050FCA;

        chain.syscall(74, payload_loader, 0x4000, (0x1 | 0x2 | 0x4));

        var pthread = p.malloc(0x10);
        {
            chain.fcall(window.syscalls[203], payload_buffer, 0x300000);
            chain.fcall(libKernelBase.add32(OFFSET_lk_pthread_create), pthread, 0x0, payload_loader, payload_buffer);
        }
        chain.run();
        LoadedMSG = "تم تشغيل BinLoader..."; // رسالة النجاح مترجمة
        // استبدال alert برسالة في الواجهة
        updateProgress("تم تشغيل BinLoader. في انتظار الـ Payload... أرسله باستخدام IP الخاص بجهاز PS4 والمنفذ 9020");
        setTimeout(allset, 50); 
    } catch (error) {
        showError("فشل تحميل BinLoader: " + error.message);
    }
}

// وظائف أخرى من index.html
function load_pocj() {
    var payload_buffer = chain.syscall(477, 0, 0x300000, 7, 0x1002, -1, 0);
    var buf = new Uint8Array(1);
    var buf_addr = p.leakval(buf);
    var old_buf = p.read8(buf_addr.add32(16));
    var old_sz = p.read4(buf_addr.add32(24));
    p.write8(buf_addr.add32(16), payload_buffer);
    p.write4(buf_addr.add32(24), PLS.length);
    for(var i = 0; i < PLS.length; i++) buf[i] = PLS[i];
    p.write8(buf_addr.add32(16), old_buf);
    p.write4(buf_addr.add32(24), old_sz);
    var pthread = p.malloc(0x10);
    chain.call(libKernelBase.add32(OFFSET_lk_pthread_create), pthread, 0x0, payload_buffer, 0);
    setTimeout(allset, 50);
}

function load_poc2() {
    var payload_buffer = chain.syscall(477, 0x0, 0x300000, 0x7, 0x1000, 0xFFFFFFFF, 0);
    var payload_loader = p.malloc32(0x1000);
    var BLDR = payload_loader.backing;
    BLDR[0]=0x56415741;BLDR[1]=0x83485541;BLDR[2]=0x894818EC;BLDR[3]=0xC748243C;BLDR[4]=0x10082444;BLDR[5]=0x483C2302;BLDR[6]=0x102444C7;BLDR[7]=0x00000000;BLDR[8]=0x000002BF;BLDR[9]=0x0001BE00;BLDR[10]=0xD2310000;BLDR[11]=0x00009CE8;BLDR[12]=0xC7894100;BLDR[13]=0x8D48C789;BLDR[14]=0xBA082474;BLDR[15]=0x00000010;BLDR[16]=0x000095E8;BLDR[17]=0xFF894400;BLDR[18]=0x000001BE;BLDR[19]=0x0095E800;BLDR[20]=0x89440000;BLDR[21]=0x31F631FF;BLDR[22]=0x0062E8D2;BLDR[23]=0x89410000;BLDR[24]=0x2C8B4CC6;BLDR[25]=0x45C64124;BLDR[26]=0x05EBC300;BLDR[27]=0x01499848;BLDR[28]=0xF78944C5;BLDR[29]=0xBAEE894C;BLDR[30]=0x00001000;BLDR[31]=0x000025E8;BLDR[32]=0x7FC08500;BLDR[33]=0xFF8944E7;BLDR[34]=0x000026E8;BLDR[35]=0xF7894400;BLDR[36]=0x00001EE8;BLDR[37]=0x2414FF00;BLDR[38]=0x18C48348;BLDR[39]=0x5E415D41;BLDR[40]=0x31485F41;BLDR[41]=0xC748C3C0;BLDR[42]=0x000003C0;BLDR[43]=0xCA894900;BLDR[44]=0x48C3050F;BLDR[45]=0x0006C0C7;BLDR[46]=0x89490000;BLDR[47]=0xC3050FCA;BLDR[48]=0x1EC0C748;BLDR[49]=0x49000000;BLDR[50]=0x050FCA89;BLDR[51]=0xC0C748C3;BLDR[52]=0x00000061;BLDR[53]=0x0FCA8949;BLDR[54]=0xC748C305;BLDR[55]=0x000068C0;BLDR[56]=0xCA894900;BLDR[57]=0x48C3050F;BLDR[58]=0x006AC0C7;BLDR[59]=0x89490000;BLDR[60]=0xC3050FCA;
    chain.syscall(74, payload_loader, 0x4000, (0x1 | 0x2 | 0x4));
    var pthread = p.malloc(0x10); {
        chain.fcall(window.syscalls[203], payload_buffer, 0x300000);
        chain.fcall(libKernelBase.add32(OFFSET_lk_pthread_create), pthread, 0x0, payload_loader, payload_buffer);
    }
    chain.run();
    sessionStorage.Payload="yes";
    setTimeout(load_pocl,2000);
}

function load_pocl() {
    var payload_buffer = chain.syscall(477, 0, 0x300000, 7, 0x1002, -1, 0);
    var buf = new Uint8Array(1);
    var buf_addr = p.leakval(buf);
    var old_buf = p.read8(buf_addr.add32(16));
    var old_sz = p.read4(buf_addr.add32(24));
    p.write8(buf_addr.add32(16), payload_buffer);
    p.write4(buf_addr.add32(24), PLS.length);
    for(var i = 0; i < PLS.length; i++) buf[i] = PLS[i];
    p.write8(buf_addr.add32(16), old_buf);
    p.write4(buf_addr.add32(24), old_sz);
    var pthread = p.malloc(0x10);
    chain.call(libKernelBase.add32(OFFSET_lk_pthread_create), pthread, 0x0, payload_buffer, 0);
    setTimeout(load_poc, 2000);
}

function runScript(what) {
    updateProgress("جاري تشغيل السكربت: " + what + "...");
    try {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", what, false);
        xhr.send("");
        if (xhr.status === 200 || xhr.status === 0) {
            eval.call(window, xhr.responseText);
            updateProgress("تم تشغيل السكربت بنجاح: " + what);
        } else {
            throw new Error("فشل تحميل السكربت. الحالة: " + xhr.status);
        }
    } catch (error) {
        showError("فشل تشغيل السكربت " + what + ": " + error.message);
        throw error;
    }
}

// وظيفة print فارغة (موجودة في الكود الأصلي)
function print(){}

// (غير مستخدمة حاليًا في الواجهة الأساسية)
function linux_group(){}
function mods_group(){}
function load_menu(){}
