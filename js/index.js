//Settings
var ang                   = window.localStorage["ang"]                    || 1;
var font_size             = window.localStorage["font_size"]              || 30;
var dark                  = window.localStorage["dark"]                   || 0;
var samaaptee             = window.localStorage["samaaptee"]              || null;
var daily                 = window.localStorage["daily"]                  || null;
var today_date            = window.localStorage["today_date"]             || null;
var today_start           = window.localStorage["today_start"]            || null;
var today_read            = ang - today_start;
var daily_total           = 0;
var swipe_nav             = window.localStorage["swipe_nav"]              || 0;
var larreevaar            = window.localStorage["larreevaar"]             || 0;
var larreevaar_assistance = window.localStorage["larreevaar_assistance"]  || 0;
var linebreak             = window.localStorage["linebreak"]              || 1;
var vishrams              = window.localStorage["vishrams"]               || 0;
var ucharan               = window.localStorage["ucharan"]                || 0;
var bold_font             = window.localStorage["bold_font"]              || 1;
var is_punjabi            = window.localStorage["punjabi"]                || 0;
var lang                  = window.localStorage["lang"]                   || "en";
var bookmark_index        = window.localStorage["bookmark_index"]         || null;
var bookmark_ang          = window.localStorage["bookmark_ang"]           || null;
var backButtonClose       = false;
var isOnline              = false;
var lefthand              = window.localStorage["lefthand"]               || 0;
var isDefaultAudio        = window.localStorage["is_default_audio"]       || 1;

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
  document.body.classList.add('h' + window.screen.height);
  document.body.classList.add(screen.orientation.type);
  screen.orientation.addEventListener('change', function() {
    document.body.classList.remove('portrait-primary');
    document.body.classList.remove('landscape-primary');
    document.body.classList.remove('landscape-secondary');
    document.body.classList.add(screen.orientation.type);
  });
  window.localStorage["no_smartbanner"] = 1;
  $("#smartbanner").remove();
  $("body").removeClass("smartbanner");
  $("script[src='js/jquery.smartbanner.js']").remove();
  //Override back button
  init();
  document.addEventListener("backbutton", function(){onBackButton(false);}, false);
}

function init() {
  isOnline = false;
  setAng(ang, false);
  if (samaaptee) {
    calculateDailyAngs(samaaptee, ang);
  } else if (daily) {
    daily_total = daily;
    calculateSamaapteeDate(daily, ang);
  }
  //Check if today var is actually today or reset
  var today         = new Date();
  var year          = today.getFullYear();
  var month         = today.getMonth();
  var day           = today.getDate();
  var today_string  = new Date(Date.UTC(year,month,day));
  today_string      = formatDate(today);
  if (today_string != today_date) {
    window.localStorage["today_date"] = today_date = today_string;
    window.localStorage["today_start"] = today_start = ang;
  }
  updateProgress();
  font_size = parseInt(font_size);
  $("#paatth").css("font-size", font_size + "px");
  $(".setting[data-setting='larreevaar']").data("on", larreevaar);
  $("#larreevaar_assistance").data("on", larreevaar_assistance);
  $("#vishrams").data("on", vishrams);
  $("#linebreak").data("on", linebreak);
  if (larreevaar == 1)            $("body, #paatth").addClass("larreevaar");
  if (linebreak == 1)            $("body, #paatth").addClass("linebreak");
  if (larreevaar_assistance == 1) $("#paatth, #larreevaar_assistance").addClass("larreevaar_assistance");
  if (vishrams == 1)              $("#paatth, #vishrams").addClass("vishrams");
  if (ucharan == 1)              $("#paatth, #ucharan").addClass("ucharan");
  $(".setting[data-setting='swipe_nav']").data("on", swipe_nav);
  $(".setting[data-setting='dark']").data("on", dark);
  $(".setting[data-setting='ucharan']").data("on", ucharan);
  $(".setting[data-setting='is_punjabi']").data("on", is_punjabi);
  $(".setting[data-setting='bold_font']").data("on", bold_font);
  if (bold_font == 1)              $("body").addClass("bold_font");
  if (dark == 1) {
    $("body").addClass("dark");
    StatusBar.backgroundColorByHexString('#222');
    StatusBar.styleLightContent();
  } else {
    StatusBar.styleDefault();
  }
  if (is_punjabi) {
    lang = "pa";
  } else {
    lang = "en";
  }
  $(".setting[data-setting='lefthand']").data("on", lefthand);
  if (lefthand == 1)              $("body").addClass("lefthand");
  $("body").addClass("lang_" + lang);
  $(".setting[data-setting='lang'][data-value='" + lang + "']").addClass("cur");
  if (bookmark_ang != null && bookmark_index != null) {
    bookmark_ang = parseInt(bookmark_ang);
    bookmark_index = parseInt(bookmark_index);
  }
  //if (Modernizr.inputtypes.date) {
    var tomorrow    = new Date(Date.UTC(year,month,(day+1)));
    tomorrow_string =  formatDate(tomorrow);
    //$("#samaaptee_date_input").attr("min",tomorrow_string);
  //} else {
    $("#samaaptee_date_input").datepicker({
      //altField: "#samaaptee_date_input",
      format: "yyyy-mm-dd",
    })
      .val(samaaptee)
      .on("changeDate", function(ev) {
        if (ev.date.valueOf() < tomorrow.valueOf()) {
          Materialize.toast("Please choose a date in the future.", 4000);
          $("#samaaptee_date_input").datepicker("setValue", tomorrow_string);
        } else {
          var new_samaaptee = $(this).val();
          $("#samaaptee_date_input").datepicker("hide");
          window.localStorage['samaaptee'] = samaaptee = new_samaaptee;
          window.localStorage.removeItem('daily');
          daily = null;
          $("#daily_angs_input").val("");
          $("#daily_angs_projected_samaaptee").text("").parent("#daily_angs_projected_samaaptee_cont").hide();
          calculateDailyAngs(samaaptee, ang);
          updateProgress();

        }
      })
    ;
    if (samaaptee) {
      $("#samaaptee_date_input").datepicker("setValue", samaaptee);
    }
  //}
  $("#daily_angs_input").val(daily);
  //Change checkboxes to checked for settings that are on
  $(".setting.checkbox").each(function(){
    if ($(this).data("on") == "1") {
      $(this).find("i").removeClass("fa-square-o").addClass("fa-check-square-o");
    }
  });
}

function calculateDailyAngs(samaaptee, ang) {
  var samaaptee_date = processDate(samaaptee);
  var daily_angs = Math.ceil((1430-ang+1)/samaaptee_date['diff']);
  $("#samaaptee_daily_angs").text(daily_angs).parent("#samaaptee_daily_angs_cont").show();
  $("#samaaptee_modal_trigger").removeClass("set").addClass("edit");
  $("#daily_modal_trigger").addClass("set").removeClass("edit");
  daily_total = daily_angs;
}
function calculateSamaapteeDate(angs, ang) {
  //Days left
  var days_left = Math.ceil((1430-ang+1)/angs);
  var date = new Date();
  var samaaptee_date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), (date.getDate() + days_left)));
  $("#daily_angs_projected_samaaptee").text(formatDate(samaaptee_date)).parent("#daily_angs_projected_samaaptee_cont").show();
  $("#daily_modal_trigger").removeClass("set").addClass("edit");
  $("#samaaptee_modal_trigger").addClass("set").removeClass("edit");
}

function updateProgress(){
  if (daily_total > 0) {
    today_read = ang - today_start;
    var percent = Math.round((today_read/daily_total*100),1);
    if (percent > 100) {
      percent = 100;
    } else if (percent < 0) {
      percent = 0;
    }
    $("#sehaj_paatth_progress").show().parent("a").addClass("hide-arrow");
    $("#sehaj_paatth_today_read").text(today_read);
    $("#sehaj_paatth_daily_total").text(daily_total);
    $("#sehaj_paatth_setting_progress_bar").css("width", percent+"%");
  } else {
    $("#sehaj_paatth_progress").hide().parent("a").removeClass("hide-arow");
    $("#sehaj_paatth_setting_progress_bar").css("width", 0);
  }
}

function processDate(future_date) {
  var oneDay    = 24*60*60*1000; // hours*minutes*seconds*milliseconds
  var new_date  = new Date(future_date);
  var today     = new Date();
  var year      = today.getFullYear();
  var month     = today.getMonth();
  var day       = today.getDate();
  today         = new Date(Date.UTC(year,month,day));

  return {
    "diff" : Math.round((new_date.getTime() - today.getTime())/(oneDay)),
    "new_date" : formatDate(new_date)
  }
}

function formatDate(date) {
  var year  = date.getUTCFullYear();
  var month = date.getUTCMonth() + 1;
  var day   = date.getUTCDate();
  month     = (month < 10) ? "0" + month : month;
  day       = (day < 10) ? "0" + day : day;

  return "" + year + "-" + month + "-" + day;
}

function openTatkaraGurmukhi(dismissSideNav = false) {
  if (dismissSideNav) {
    $("#settings_button").click();
  }
  $.get("tatkara.html", function(data) {
    $("#paatth").html(data);
  });
}

function openTatkaraEnglish() {
  $.get("tatkara_english.html", function(data) {
    $("#paatth").html(data);
  });
}

function openTatkaraAudio() {
  $.get("tatkara_audio.html", function(data) {
    $("#paatth").html(data);
  });
}

function openTatkaraAkps() {
  $.get("tatkara_akps.html", function(data) {
    $("#paatth").html(data);
  });
}

function returnToAng() {
  init();
}

function showUcharanBox(e, raw_div) {
  var div_id = raw_div.id
  var div = document.getElementById(div_id);
  var text_length = div.innerHTML.length;
  var left = e.clientX;
  var top = e.clientY;
  var edge_padding = 200;
  var padding_constant = 100;
  if (screen.width - left < edge_padding) {
    left -= padding_constant + (text_length * 2);
  }
  if (screen.height - top < edge_padding) {
    top -= padding_constant;
  }
  div.style.left = left + "px";
  div.style.top = top + "px";
  $("#"+div_id).toggle();
  return false;
}

function setAng(set_ang, store) {
  store = typeof store !== 'undefined' ? store : true;
  //Make sure it's an Ang within the proper range or set to 1
  var set_ang = parseInt(set_ang);
  if (isNaN(set_ang) || set_ang < 1 || set_ang > 1430) {
    return
  }
  //Set the one before and one after
  var minus1 = ((set_ang - 1) >= 1 ? (set_ang - 1) : 1);
  var plus1  = ((set_ang + 1) <= 1430 ? (set_ang + 1) : 1430);
  $(".ang").val(set_ang);
  ang = set_ang;
  $(".minus1").data("ang", minus1);
  $(".plus1").data("ang", plus1);
  var newPaatth = '';
  var endpoint = "paatth/" + ang + ".html";
  var ucharan_regex = /(.*)\}/;

  var sirlekhList = [
    'ਮਹਲਾ',
    'ਮਹਲੇ',
    'ਭਗਤਾ ਕੀ',
    'ਭਗਤਾਂ ਕੀ',
    'ਜੀਉ ਕੀ',
    'ਜੀ ਕੀ',
    'ਜੀ ਕੰੀ',
    'ਰਾਗੁ',
    'ਚਉਪਦੇ',
    'ਕਾ ਪਦਾ',
    'ਕੇ ਪਦੇ',
    'ਸਲੋਕ ਵਾਰਾਂ',
  ];

  var titleMangalAngList = [1, 14, 94, 151, 347, 489, 527, 537, 557, 595, 660, 
    696, 711, 719, 721, 728, 795, 859, 876, 975, 984, 989, 1107, 1118, 
    1125, 1168, 1197, 1254, 1294, 1319, 1327, 1352, 1385, 1410];

  $.get(endpoint, function(data) {
    var gurbani = data;
    var shabads = [];

    // use private-use characters for legibility and to render on WebKit
    gurbani = gurbani
    .replace(/ਂੀ/g,'\u0A40\uF03D') // ਂ+ੀ
    .replace(/ੰੀ/g,'\u0A40\uF034') // ੰ+ੀ
    .replace(/\u0A72\u0A40\uF03D/g,'\u0A08\uF03D') // ਂ+ਈ
    .replace(/\u0A72\u0A40\uF034/g,'\u0A08\uF034'); // ੰ+ਈ

    var isTitleMangal = titleMangalAngList.includes(set_ang);
    var isLinebreak = $("#paatth").hasClass("linebreak");
    var isLarivaar = $("#paatth").hasClass("larreevaar");

    lines = gurbani.split('!');

    var ucharanPaath = '';
      $.each(lines, function(index,line){
        pangti = line.replace(ucharan_regex,'');

        // join hadh to look like traditional larivaar
        if (isLinebreak || isLarivaar) {  
          if (index != 0 && index != (lines.length - 1)) {
            pangti = `\uF042${pangti}`;
          }
          pangti = pangti
          .replace(' ॥', '\uF042 ॥')
          .replace(/([ਅ-ੌ]+) ॥/g, '$1\uF042 ॥')
          .replace(/॥ ([ਅ-ੌ]+)/g, '॥ \uF042$1');
        }

        mangalType = (isTitleMangal == true && index <= 1) ? '$' : '!';
        formattedPangti = `${mangalType}${pangti}${mangalType}`;
        // check for sirlekh
        if (
          sirlekhList.some(substring=>pangti.includes(substring)) ||
          /ਸ੍ਰ.{1,}ਜੀ/.test(pangti) ||
          /ਬਾਣੀ.{1,}ਜੀ/.test(pangti)
        ) {
          if (index > 0) {
            prevPangti = lines[index-1];
            if (prevPangti.includes('ੴ')) {
              pangti = formattedPangti;
            }
          }
          if (index < lines.length) {
            nextPangti = lines[index+1];
            if (nextPangti.includes('ੴ')) {
              pangti = formattedPangti;
            }
          }
        }

        // check for mangal
        if (pangti.includes('ੴ')) {
          pangti = formattedPangti;
        }

        // full mool mantar
        // if (set_ang == 1 && index < 4) {
        //   pangti = `$${pangti}$`;
        // }

        words = pangti.split(' ');

        // add ucharan tip to the corresponding word 
        ucharanTip = (line.split("{")[1] ||"").split("}")[0];
        if (ucharanTip.length > 0) {
          ucharan_words = ucharanTip.split('।');
          ucharan_map = {};
          for (ucharan_word of ucharan_words) {
            gurbani_word = ucharan_word.split(':')[0]
            .replace(/_/g,'')
            .replace(/-/g,'')
            .replace(/ੱ/g,'')
            .replace(/ੑ/g,'')
            .replace(/ਂ/g,'');
            ucharan_map[gurbani_word] = ucharan_word;
          }
          words_with_ucharan = [];
          for (word of words) {
            plain_word = word
            .replace('!','')
            .replace('$','')
            .replace(';','')
            .replace(',','')
            .replace('.','')
            .replace('\uF042','');
            if (plain_word in ucharan_map) {
              new_word = "{" + ucharan_map[plain_word] + "}" + word
              words_with_ucharan.push(new_word);
            } else if (word.includes('॥')) {
              new_word = "{" + ucharanTip + "}" + word
              words_with_ucharan.push(new_word);      
            } else {
              words_with_ucharan.push(word);
            }
          }
          shabads = shabads.concat(words_with_ucharan);
        } else {
          shabads = shabads.concat(words);
        }
      });
      var prevWordWasMangal = false;
      $.each(shabads, function(index,val){
        firstChar = val.at(0);
        lastChar = val.at(-1);
        word = val;
        hasUcharan = false;
        isLinebreakActive = $("#paatth").hasClass("linebreak");

        // ucharan
        ucharanTip = '';
        if (firstChar == '{') {
          word = val.replace(ucharan_regex,'');
          ucharanTip = (val.split('{')[1] || '').split('}')[0]
          .replace(/_/g, ' ')
          .replace(/([₁-₈]+)/g, '');
          firstChar = word.at(0);
          hasUcharan = true;
        }

        // linebreak mode (traditional larivaar)
        spacingPaath = ' ';
        if (isLinebreakActive) {
          spacingPaath = '&ZeroWidthSpace;';
        }

        word = word
        .replace(/([੦-੯]+)\uF042/, `<span id="num_spacing">$1&hairsp;</span>`)
        .replace(/([₁-₈]+)\uF042/, '$1')
        .replace('\uF03D\uF042', '\uF03D')
        .replace('\uF034\uF042', '\uF034');
        
        if (prevWordWasMangal) {
          word = word.replace('\uF042', '');
          prevWordWasMangal = false;
        }

        // mangals
        spacingStart = spacingEnd = '';
        mangalSpacing = '<span id="spacing">&ensp;&ensp;&ensp;</span>';
        if (firstChar == '!') {
          spacingStart = mangalSpacing;
          word = word.replace('!\uF042', '!');
        } else if (firstChar == '$') {
          // replace oangkaar with larger 'kaar'; (single glyph: '\uF035')
          // word = word.replace('ੴ', '\uF036\uF037');

          // add linebreaks around title mangal
          spacingStart = `<div id="mangal_${index}" class="mangal_box">`;

          word = word.replace('$\uF042', '$');
        }
        if (lastChar == '!') {
          spacingEnd = mangalSpacing;
          prevWordWasMangal = true;
        } else if (lastChar == '$') {
          spacingEnd = `</div>`;
          prevWordWasMangal = true;
        }
        word = word.replace(/!/g,'');
        word = word.replace(/\$/g,'');
        lastChar = word.at(-1);

        if (lastChar == '॥') {
          closing_tag = 'i';
          if (hasUcharan) {
            tag = 'i id="ucharan_tip"';
          } else {
            tag = 'i';
          }          
        } else if (lastChar == 'ੴ') {
          tag = 'span id="beej_mantar"';
          closing_tag = 'span';
        } else {
          tag = closing_tag = 'span';
        }

        if (word == '\uF036\uF037') {
          tag += ' class="beej_mantar_title"';
        }

        // vishrams
        if (lastChar == ';') {
          tag += ' class="large-pause"';
          word = word.slice(0,-1);
        } else if (lastChar == ',') {
          tag += ' class="medium-pause"';
          word = word.slice(0,-1);
        } else if (lastChar == '.') {
          tag += ' class="small-pause"';
          word = word.slice(0,-1);
        }

        // sirlekh surtaal ank subscripts
        word = word
        .replace('₁₅', '\uF051')
        .replace('₁', '\uF04A')
        .replace('₂', '\uF04B')
        .replace('₃', '\uF04C')
        .replace('₄', '\uF04D')
        .replace('₅', '\uF04E')
        .replace('₆', '\uF04F')
        .replace('₈', '\uF050');

        // ucharan
        if (hasUcharan) {
          var divLabel = `word_${index}`;
          ucharanPaath += `<div id="${divLabel}" class="ucharan_box">${ucharanTip}</div>`;
          tag += ` onmouseover="showUcharanBox(event,${divLabel})" onmouseout="showUcharanBox(event,${divLabel})"`;
        }

        // generate word tag
        newPaatth += `${spacingStart}<${tag}>${word}</${closing_tag}>${spacingPaath}${spacingEnd}`;

        // dedupe spacing between sirlekhs and mangals
        newPaatth = newPaatth.replace(`${mangalSpacing}${mangalSpacing}`,`${mangalSpacing}`);
      });
    newPaatth += ucharanPaath;

    $("#paatth").html(newPaatth);

    // audio stream
    if (isDefaultAudio == 1) {
      playSehajPaathAudio(ang, false);
    }
    setSehajPaathAng(ang);
    setPaathBodhAngRange(ang);
    setKathaAngs(ang);

    //Check for bookmark and insert it
    if (bookmark_ang == ang && bookmark_index > -1) {
      $("#paatth *").eq(bookmark_index).after($("<i></i>").addClass("fa fa-bookmark"));
    }
  });
  if (store === true) {
    window.localStorage["ang"] = ang;
    //Check for bookmark and remove
    if (bookmark_ang) {
      window.localStorage.removeItem('bookmark_ang');
      window.localStorage.removeItem('bookmark_index');
      bookmark_ang = null;
      bookmark_index = null;
      Materialize.toast("Bookmark removed", 4000);
    }
  } else {
    //Loading for the first time
    //Check for bookmark and insert it
    if (bookmark_ang == ang && bookmark_index > -1) {
      $("#paatth *").eq(bookmark_index).after($("<i></i>").addClass("fa fa-bookmark"));
    }
  }
}

function setSehajPaathAng(ang) {
  var audioLink = `<a href="javascript:playSehajPaathAudio(${ang}, true)">Sehaj Paath Audio Ang ${ang}</a>`;
  $("#audio_link_sp").html(audioLink);
}

function setPaathBodhAngRange(ang) {
  var section = "";
  var santhiya_audio = [];
  if (ang >= 1 && ang < 388) {
    section = "0001-0388";
    santhiya_audio = getSanthiyaV1();
  } else if (ang >= 388 && ang < 807) {
    section = "0388-0807";
    santhiya_audio = getSanthiyaV2();
  } else if (ang >= 807 && ang < 1231) {
    section = "0807-1231";
    santhiya_audio = getSanthiyaV3();
  } else if (ang >= 1231 && ang < 1430) {
    section = "1231-1430";
    santhiya_audio = getSanthiyaV4();
  }

  var tracks = santhiya_audio.filter(function (track) {
    return track.start <= ang && track.end > ang;
  });
  var track = tracks[0];
  var range = `${track.start}-${track.end}`;
  var url = `https://www.gurmatveechar.com/audios/Gurbani_Santhya/Bhindran_Taksal_Santhya/Ang_${section}/${track.id}--Bhindran.Taksal.Santhya--Ang.${track.suffix}.mp3`;
  var audioLink = `<a href="javascript:playPaathBodhAudio('${url}', '${range}', '${ang}')">Santhiya Audio Angs ${range}</a>`;
  $("#audio_link_bp").html(audioLink);
}

function setKathaAngs(ang) {
  const tracks = getKathaUrls(ang);
  var audioLink = audioTitle = moreLinks = '';
  if (tracks.length > 0) {
    audioLink = `<a href="javascript:playKathaAudio('${tracks[0]}', 'Ang ${ang}')">Katha Ang ${ang}</a>`;
  } else {
    audioLink = '<a>-</a>';
  }
  if (tracks.length > 1) {
    for (i = 1; i < tracks.length; i++) {
      const track = tracks[i];
      moreLinks += `<li><a href="javascript:playKathaAudio('${track}', 'Ang ${ang}, Track ${i+1}')">Track ${i+1}</a></li>`;
    }
    audioTitle = 'More Katha Tracks';
  } else {
    audioTitle = '-';
  }
  $("#audio_link_kp").html(audioLink);
  $("#audio_link_kp_more").html(moreLinks);
  $("#audio_link_kp_title").html(audioTitle);
}

function getKathaUrls(ang) {
  v = r = "";
  var katha_audio = [];
  if (ang >= 1 && ang <= 70) {
    v = "01";
    r = "0001-0070";
    katha_audio = getKathaV1();
  } else if (ang >= 71 && ang <= 150) {
    v = "02";
    r = "0071-0150";
    katha_audio = getKathaV2();
  } else if (ang >= 151 && ang <= 249) {
    v = "03";
    r = "0151-0249";
    katha_audio = getKathaV3();
  } else if (ang >= 250 && ang <= 346) {
    v = "04";
    r = "0250-0346";
    katha_audio = getKathaV4();
  } else if (ang >= 347 && ang <= 461) {
    v = "05";
    r = "0347-0462";
    katha_audio = getKathaV5();
  } else if (ang >= 462 && ang <= 536) {
    v = "06";
    r = "0462-0536";
    katha_audio = getKathaV6();
  } else if (ang >= 537 && ang <= 659) {
    v = "07";
    r = "0537-0659";
    katha_audio = getKathaV7();
  } else if (ang >= 660 && ang <= 761) {
    v = "08";
    r = "0660-0761";
    katha_audio = getKathaV8();
  } else if (ang >= 762 && ang <= 875) {
    v = "09";
    r = "0762-0875";
    katha_audio = getKathaV9();
  } else if (ang >= 876 && ang <= 974) {
    v = "10";
    r = "0876-0974";
    katha_audio = getKathaV10();
  } else if (ang >= 975 && ang <= 1070) {
    v = "11";
    r = "0975-1070";
    katha_audio = getKathaV11();
  } else if (ang >= 1071 && ang <= 1167) {
    v = "12";
    r = "1071-1167";
    katha_audio = getKathaV12();
  } else if (ang >= 1168 && ang <= 1253) {
    v = "13";
    r = "1168-1273";
    katha_audio = getKathaV13();
  } else if (ang >= 1254 && ang <= 1351) {
    v = "14";
    r = "1254-1351";
    katha_audio = getKathaV14();
  } else if (ang >= 1352 && ang <= 1430) {
    v = "15";
    r = "1352-1430";
    katha_audio = getKathaV15();
  }

  var tracks = katha_audio.filter(function (track) {
    // const angs = track.ang.split("-");
    // return (angs[0] == `${ang}` || angs[1] == `${ang}` || angs[2] == `${ang}`);
    return track.ang.split("-")[0] == `${ang}`;
  });
  track_list = [];
  for (i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    const url = `https://www.gurmatveechar.com/audios/Katha/01_Puratan_Katha/Sant_Gurbachan_Singh_%28Bhindran_wale%29/Guru_Granth_Sahib_Larivaar_Katha/Volume_${v}_Ang_${r}/${track.id}--Sant.Gurbachan.Singh.%28Bhindran.wale%29--${track.name}.mp3`;
    track_list.push(url);
  }
  return track_list;
}

// katha audio
function playKathaAudio(url, name) {
  var nowPlaying = `Katha, ${name}`;
  $("#now_playing").html(nowPlaying);
  isDefaultAudio = 0;
  playAudio(url, true);
}

// ang-range audio paath
function playPaathBodhAudio(url, range, ang) {
  var nowPlaying = `Santhiya, Angs ${range}`;
  $("#now_playing").html(nowPlaying);
  isDefaultAudio = 0;
  playAudio(url, true);
}

// ang-wise audio
function playSehajPaathAudio(angNumber, autoPlay) {
  var formattedAng = String(angNumber).padStart(4, '0');
  var url = `https://media.gursevak.com/media/Sehaj_Paath_Pagewise/Sehaj_Paath_16kbps/${formattedAng}.mp3`;
  var nowPlaying = `Sehaj Paath, Ang ${angNumber}`;
  $("#now_playing").html(nowPlaying);
  isDefaultAudio = 1;
  playAudio(url, autoPlay);
}

function playAudio(streamUrl, autoPlay) {
  var audioConfig = (autoPlay == true) ? 'autoplay' : '';
  var audioSource = `<audio controls ${audioConfig} preload="none" id="player"><source src="${streamUrl}" type="audio/mpeg"></audio>`;
  $("#audio_stream").html(audioSource);
}

function toggleLanguage(new_lang) {
  lang = new_lang;
  $("body").removeClass (function (index, css) {
    return (css.match (/\blang_\S+/g) || []).join(' ');
  });
  $("body").addClass("lang_" + lang);
  window.localStorage["lang"] = lang;
  $(".setting[data-setting='lang']").removeClass("cur");
  $(".setting[data-setting='lang'][data-value='" + lang + "']").addClass("cur");
}

function onBackButton(esc_button) {
  esc_button = typeof esc_button !== 'undefined' ? esc_button : false;
  if ($(".datepicker:visible").length > 0) {
    $("#samaaptee_date_input").blur().datepicker("hide");
  } else if ($(".modal:visible").length > 0) {
    $(".modal").closeModal();
  } else if (parseInt($(".side-nav.right-aligned").css("right")) == 0 || parseInt($(".side-nav.left-aligned").css("left")) == 0) {
    $(".button-collapse").sideNav("hide");
  } else if (!esc_button) {
      if (backButtonClose == true) {
        navigator.app.exitApp();
      } else {
        backButtonClose = true;
        Materialize.toast("Press again to exit", 4000, "", function(){ backButtonClose = false; });
      }
  }
}

$(function() {
  $(".external-link").click(function() {
    var externalLink = $(this).attr("href");
    cordova.plugins.browsertab.isAvailable(function(result) {
      if (!result) {
        cordova.InAppBrowser.open(externalLink, '_system');
      } else {
        cordova.plugins.browsertab.openUrl(externalLink);
      }
    })
  })

  $(".browser-link").click(function() {
    var browserLink = $(this).attr("href");
    window.open(browserLink, "_system");
    return false;
  })

  $("#settings_button").click(function() {
    $('.button-collapse').sideNav('show');
    $('#settings_button').toggleClass('selected');
  });
  //FONT SIZE
  $(".bigger").click(function () {
    font_size += 1;
    $("#paatth").css("font-size", font_size + "px");
    window.localStorage["font_size"] = font_size;
  });
  $(".smaller").click(function () {
    font_size -= 1;
    $("#paatth").css("font-size", font_size + "px");
    window.localStorage["font_size"] = font_size;
  });
  //CHANGE ANG
  $(".ang").blur(function() {
    $(".submit_ang").submit();
  }).keypress(function(event) {
    if (event.keyCode == 13) {
      $(this).blur();
      event.preventDefault();
    }
  });
  $(".ang").blur(function(event) {
    var newAng = parseInt($(this).val());
    if (newAng != ang) {
      ang = newAng;
      setAng(ang);
      window.localStorage["today_start"] = today_start = ang;
      if (samaaptee) {
        calculateDailyAngs(samaaptee, ang);
      }
      updateProgress();
      event.preventDefault();
    }
  });
  $("#navigation a.minus1, #navigation a.plus1").click(function () {
    setAng($(this).data("ang"));
    if ($(this).hasClass('minus1')) {
    } else {
    }
    updateProgress();
  });
  $(".ang").focus(function(){
    $(this).select();
  })
  $(".setting").click(function () {
    setting = $(this).data("setting");
    data_on = $(this).data("on");
    if (data_on == "0") {
      window.localStorage[setting] = 1;
      $(this).data("on", "1");
      switch(setting) {
        case "larreevaar_assistance":
          $(this).addClass(setting);
          $("#paatth").addClass(setting);
          break;
        case "vishrams":
          $("#paatth").addClass(setting);
          break;
        case "linebreak":
          $("body, #paatth").addClass(setting);
          setAng(ang);
          break;
        case "larreevaar":
          $("body, #paatth").addClass(setting);
          setAng(ang);
          break;
        case "ucharan":
          $("#paatth").addClass(setting);
          break;
        case "swipe_nav":
          swipe_nav = 1;
          break;
        case "dark":
          $("body").addClass(setting);
          StatusBar.backgroundColorByHexString('#222');
          StatusBar.styleLightContent();
          break;
        case "bold_font":
          $("body").addClass(setting);
          break;
        case "is_punjabi":
          toggleLanguage("pa");
          break;
        case "lefthand":
          $("body").addClass(setting);
          break;
      }
      if ($(this).hasClass("checkbox")) {
        $(this).find("i.fa-square-o").removeClass("fa-square-o").addClass("fa-check-square-o");
      }
    } else if (data_on == "1") {
      window.localStorage[$(this).data("setting")] = 0;
      $(this).data("on", "0");
      switch(setting) {
        case "larreevaar_assistance":
          $(this).removeClass(setting);
          $("#paatth").removeClass(setting);
          break;
        case "vishrams":
          $("#paatth").removeClass(setting);
          break;
        case "linebreak":
          $("body, #paatth").removeClass(setting);
          setAng(ang);
          break;
        case "larreevaar":
          $("body, #paatth").removeClass(setting);
          setAng(ang);
          break;
        case "ucharan":
          $("#paatth").removeClass(setting);
          break;
        case "swipe_nav":
          swipe_nav = 0;
          break;
        case "dark":
          $("body").removeClass(setting);
          StatusBar.backgroundColorByHexString('#fff');
          StatusBar.styleDefault();
          break;
        case "bold_font":
          $("body").removeClass(setting);
          break;
        case "is_punjabi":
          toggleLanguage("en");
          break;
        case "lefthand":
          $("body").removeClass(setting);
          break;
      }
      if ($(this).hasClass("checkbox")) {
        $(this).find("i.fa-check-square-o").removeClass("fa-check-square-o").addClass("fa-square-o");
      }
    }
  });
  $("#daily_angs_input").change(function() {
    var new_daily = parseInt($(this).val());
    if (new_daily > 0) {
      new_daily = (new_daily > 1430) ? 1430 : new_daily;
      window.localStorage['daily'] = daily = daily_total = new_daily;
      window.localStorage.removeItem('samaaptee');
      $(this).val(new_daily);
      calculateSamaapteeDate(daily, ang);
      updateProgress();
      samaaptee = null;
      $("#samaaptee_date_input").val("");
      $("#samaaptee_daily_angs").text("").parent("#samaaptee_daily_angs_cont").hide();
    } else if (new_daily == 0) {
      window.localStorage.removeItem("daily");
      daily = daily_total = null;
      $("#daily_angs_projected_samaaptee").text("").parent("#daily_angs_projected_samaaptee_cont").hide();
      window.localStorage.removeItem('samaaptee');
      samaaptee = null;
      $("#samaaptee_date_input").val("");
      $("#samaaptee_daily_angs").text("").parent("#samaaptee_daily_angs_cont").hide();
      updateProgress();
    } else {
      alert("Invalid number");
    }
  });
  if (!window.localStorage['no_smartbanner']) {
    $.smartbanner({
      layer: true,
      speedIn: 400
    });
  }
  //Hammer gesture recognition
  var myElement = document.getElementById('paatth');
  var mc = new Hammer(myElement);
  //Bookmarking
  mc.add(new Hammer.Tap({ event: "doubletap", taps: 2 }));
  mc.add(new Hammer.Tap());
  mc.get("doubletap").recognizeWith("tap");
  mc.on("doubletap", function(ev) {
    var prev_i_index,
        next_i_index;

    $("#paatth i.fa.fa-bookmark").remove();
    var doubletap_index = $(ev.target).index();
    if (ev.target.tagName == "I") {
      bookmark_index = doubletap_index;
    } else {
      //Find closest <i> and put bookmark after
      prev_i_index = $(ev.target).prevAll("i").eq(0).index();
      next_i_index = $(ev.target).nextAll("i").eq(0).index();
      if ((doubletap_index - prev_i_index) < (next_i_index - doubletap_index)) {
        //Prev <i> is closer
        bookmark_index = prev_i_index;
      } else {
        //Next <i> is closer
        bookmark_index = next_i_index;
      }
    }
    //Set localStorage variable and add icon
    window.localStorage["bookmark_index"] = bookmark_index;
    window.localStorage["bookmark_ang"]   = ang;
    bookmark_ang                          = ang;
    $("#paatth *").eq(bookmark_index).after($("<i></i>").addClass("fa fa-bookmark"));
  })
    mc.get("swipe").set({
      direction: Hammer.DIRECTION_HORIZONTAL,
      velocity: 0.2
    })
    mc.on("swipeleft swiperight", function(ev) {
      if (swipe_nav == 1) {
        switch(ev.type) {
          case 'swiperight':
            $(".minus1").click();
            break;
          case "swipeleft":
            $(".plus1").click();
            break;
        }
      }
    });
  //KEYBOARD NAVIGATION
  $(document).keydown(function(event) {
    if (!$(document.activeElement).is("input")) {
      switch (event.keyCode) {
        //Esc
        case 27:
          onBackButton(true);
          break;
        //Left Arrow
        case 37:
          $(".minus1").click();
          break;
        //Right Arrow
        case 39:
          $(".plus1").click();
          break;
      }
    }
  });
  $(document).keypress(function(event) {
    if (!$(document.activeElement).is("input")) {
      switch (event.keyCode) {
        //+
        case 43:
          event.preventDefault();
          $("#zoom_in_button").click();
          break;
        //-
        case 45:
          event.preventDefault();
          $("#zoom_out_button").click();
          break;
        //a
        case 97:
          event.preventDefault();
          if ($("#paatth").hasClass("larreevaar") || $("#paatth").hasClass("linebreak")) {
            $("#larreevaar_assistance").click();
          }
          break;
        //b
        case 98:
          event.preventDefault();
          $("#bold_font").click();
          break;
        //v
        case 118:
          event.preventDefault();
          $("#vishrams").click();
          break;
        //u
        case 117:
          event.preventDefault();
          $("#ucharan").click();
          break;
        //L
        case 76:
          event.preventDefault();
          if (!$("#paatth").hasClass("larreevaar")) {
            $("#linebreak").click();
          }
          break;
        //l
        case 108:
          event.preventDefault();
          if (!$("#paatth").hasClass("linebreak")) {
            $("#larreevaar_setting").click();
          }
          break;
        //m
        case 109:
          event.preventDefault();
          $("#settings_button").click();
          break;
        //n
        case 110:
          event.preventDefault();
          $("#night_mode_button").click();
          break;
      }
    }
  });
});