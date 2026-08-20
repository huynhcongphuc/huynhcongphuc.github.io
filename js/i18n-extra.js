(()=>{
  const viToEn={
    'Thống kê':'Statistics',
    'Tóm tắt năng lực':'Engineering snapshot',
    'Năm kinh nghiệm':'Years of experience',
    'Sản phẩm phần mềm':'Software products',
    '03 · SẢN PHẨM NỔI BẬT':'03 · FEATURED PRODUCTS',
    'Từ bài toán kỹ thuật':'From engineering problems',
    'đến công cụ thực tế.':'to practical tools.',
    'Một số phần mềm được phát triển cho tích hợp giao thức, mô phỏng DER/Microgrid và bảo mật dữ liệu.':'Selected software developed for protocol integration, DER/Microgrid simulation, and data security.',
    'Máy chủ đa giao thức cho IEC 60870-5-104, Modbus và IEEE 2030.5.':'A multi-protocol server for IEC 60870-5-104, Modbus, and IEEE 2030.5.',
    'Mô phỏng nguồn phân tán, phụ tải, BESS và Zero Export sát tình huống vận hành.':'Simulation of distributed generation, loads, BESS, and Zero Export for realistic operating scenarios.',
    'Mô phỏng PV, BESS, phụ tải và máy phát điện dầu trên nền Modbus TCP/IP.':'Simulation of PV, BESS, loads, and diesel generation over Modbus TCP/IP.',
    'Xem sản phẩm':'View product',
    '04 · HÀNH TRÌNH':'04 · JOURNEY',
    '05 · NGHIÊN CỨU NỔI BẬT':'05 · FEATURED RESEARCH',
    'Tiêu chuẩn sâu.':'Standards in depth.',
    'Triển khai thật.':'Real-world implementation.',
    'Nội dung nghiên cứu tập trung kết nối kiến trúc DERMS, IEEE 2030.11 và IEEE 2030.5 với bài toán triển khai thực tế.':'Research connecting DERMS architecture, IEEE 2030.11, and IEEE 2030.5 with real implementation challenges.',
    'Tài liệu chuyên sâu về kiến trúc, giao thức, bảo mật và mô hình triển khai DERMS.':'In-depth material on DERMS architecture, protocols, cybersecurity, and deployment models.',
    'Xem nghiên cứu':'View research',
    'Các nghiên cứu và tài liệu kỹ thuật về DERMS, nguồn phân tán, FLISR, lưu trữ năng lượng và vận hành lưới điện hiện đại.':'Research and technical materials on DERMS, distributed generation, FLISR, energy storage, and modern grid operation.',
    '01 · TÀI LIỆU CHUYÊN KHẢO':'01 · TECHNICAL MONOGRAPH',
    '03 BÀI BÁO ĐÃ CÔNG BỐ':'03 PUBLISHED PAPERS',
    'Các công trình đồng tác giả về độ tin cậy ABESS, FLISR và vận hành lưới điện phân phối có nguồn phát phân tán.':'Co-authored publications on ABESS reliability, FLISR, and distribution-grid operation with distributed generation.',
    '02 · BÀI BÁO KHOA HỌC':'02 · JOURNAL ARTICLE',
    '04 · BÀI BÁO KHOA HỌC':'04 · JOURNAL ARTICLE',
    'Phương pháp đánh giá độ tin cậy của hệ thống pin lưu trữ năng lượng ABESS có xem xét đến sự ảnh hưởng của các hiện tượng dao động xuất hiện trong quá trình vận hành':'Reliability assessment method for an ABESS energy storage system considering operational fluctuation effects',
    'Nghiên cứu sử dụng phương pháp phân tích dựa trên mô hình Markov để đánh giá độ tin cậy của ABESS trong Microgrid tích hợp PV dưới các kịch bản dao động vận hành, điện áp và tổn thất công suất.':'The study uses a Markov-model-based method to assess ABESS reliability in a PV-integrated microgrid under operating fluctuations, voltage variations, and power-loss scenarios.',
    'Tạp chí':'Journal',
    'Đồng tác giả':'Co-authors',
    'Huỳnh Công Phúc và cộng sự':'Huynh Cong Phuc et al.',
    'Tải PDF bài báo':'Download paper PDF',
    'Minh họa hệ thống ABESS trong Microgrid và dao động vận hành':'Illustration of an ABESS in a microgrid under operating fluctuations',
    '03 · IEEE CONFERENCE PAPER':'03 · IEEE CONFERENCE PAPER',
    'Bài báo đề xuất phương pháp FLISR cho lưới điện phân phối tích hợp DG, kết hợp ngưỡng tác động bảo vệ quá dòng, trạng thái thiết bị đóng cắt và mất điện áp để phát hiện–định vị sự cố, sau đó xếp hạng phương án khôi phục cấp điện. Mô hình được kiểm chứng trên lưới 22 kV bằng E-Terra.':'The paper proposes a FLISR method for DG-integrated distribution networks, combining overcurrent protection thresholds, switching-device status, and loss of voltage for fault detection and location, then ranking service-restoration plans. The method is validated on a 22 kV network using E-Terra.',
    'Hội nghị':'Conference',
    'Cong Phuc Huynh và cộng sự':'Cong Phuc Huynh et al.',
    'Mở bài báo / PDF':'Open paper / PDF',
    'Minh họa FLISR trên lưới điện phân phối tích hợp nguồn phát phân tán':'Illustration of FLISR on a distribution network with distributed generators',
    'Phương pháp phát hiện, định vị, cách ly sự cố và khôi phục cung cấp điện cho lưới điện phân phối có xem xét đến sự xuất hiện của nguồn phát phân tán':'Fault detection, location, isolation, and service restoration method for distribution networks considering distributed generation',
    'Phương pháp FLISR xem xét ảnh hưởng của DG, sử dụng tín hiệu bảo vệ, trạng thái đóng/cắt và vùng mất điện để xác định phân đoạn sự cố; việc khôi phục được tối ưu theo hai ràng buộc và sáu chỉ số hiệu quả. Kết quả trên mô hình 22 kV E-Terra cho thời gian xử lý dưới hai phút.':'The FLISR method considers DG impacts and uses protection signals, switching status, and de-energized areas to identify the faulted section; restoration is optimized using two constraints and six performance indices. Results on a 22 kV E-Terra model show a processing time below two minutes.',
    'Minh họa chu trình phát hiện định vị cách ly sự cố và khôi phục cung cấp điện FLISR':'Illustration of the FLISR fault detection, location, isolation, and service-restoration process',
    'THỐNG KÊ WEBSITE':'WEBSITE STATISTICS',
    'Dữ liệu truy cập':'Traffic data',
    '& lượt tải.':'& downloads.',
    'Thống kê tổng hợp lượt truy cập và lượt tải tài liệu, phần mềm trên website.':'Aggregated statistics for website visits and document/software downloads.',
    'Đang hoạt động · 30 phút':'Active · 30 minutes',
    'Lượt xem · 30 phút':'Views · 30 minutes',
    'Hôm nay':'Today','7 ngày':'7 days','30 ngày':'30 days','Từ khi thống kê':'All time',
    'Phiên truy cập':'Sessions','Người dùng':'Users','Việt Nam':'Vietnam','Lượt tải':'Downloads',
    'Quốc gia truy cập':'Visitor countries','Quốc gia':'Country','Lượt tải theo phần mềm':'Downloads by software','Phần mềm':'Software',
    'Cập nhật dữ liệu...':'Updating data...','Dữ liệu thống kê đang được cập nhật.':'Statistics are being updated.','Thống kê website':'Website statistics'
  };
  const enToVi=Object.fromEntries(Object.entries(viToEn).map(([vi,en])=>[en,vi]));

  function replaceText(root,map){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){return n.parentElement&&['SCRIPT','STYLE'].includes(n.parentElement.tagName)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}});
    const nodes=[]; while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      const raw=node.nodeValue,trim=raw.trim();
      if(!trim||!map[trim])return;
      const lead=raw.match(/^\s*/)?.[0]||'',tail=raw.match(/\s*$/)?.[0]||'';
      node.nodeValue=lead+map[trim]+tail;
    });
    root.querySelectorAll('[aria-label],[alt],[title]').forEach(el=>{
      ['aria-label','alt','title'].forEach(attr=>{const v=el.getAttribute(attr);if(v&&map[v])el.setAttribute(attr,map[v]);});
    });
  }

  function apply(){
    const lang=(document.documentElement.lang||'vi').toLowerCase();
    replaceText(document,lang.startsWith('en')?viToEn:enToVi);
  }

  document.addEventListener('DOMContentLoaded',()=>{
    apply();
    const toggle=document.querySelector('[data-language-toggle]');
    if(toggle)toggle.addEventListener('click',()=>setTimeout(apply,30));
    new MutationObserver(m=>{if(m.some(x=>x.type==='attributes'&&x.attributeName==='lang'))setTimeout(apply,0)}).observe(document.documentElement,{attributes:true});
  });
})();
