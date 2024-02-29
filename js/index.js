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
var linebreak             = window.localStorage["linebreak"]              || 0;
var vishrams              = window.localStorage["vishrams"]               || 1;
var ucharan               = window.localStorage["ucharan"]                || 0;
var bold_font             = window.localStorage["bold_font"]              || 0;
var is_punjabi            = window.localStorage["punjabi"]                || 0;
var lang                  = window.localStorage["lang"]                   || "en";
var bookmark_index        = window.localStorage["bookmark_index"]         || null;
var bookmark_ang          = window.localStorage["bookmark_ang"]           || null;
var backButtonClose       = false;
var isOnline              = false;
var keep_awake            = window.localStorage["keep_awake"]             || 0;
var lefthand              = window.localStorage["lefthand"]               || 0;
var isDefaultAudio        = window.localStorage["is_default_audio"]       || 1;
var isWebkit              = navigator.userAgent.indexOf('AppleWebKit') != -1
var isChromium            = navigator.userAgent.indexOf('Chromium') != -1

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
  $(".setting[data-setting='keep_awake']").data("on", keep_awake);
  if (keep_awake == 1)            window.plugins.insomnia.keepAwake();
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

function openTatkaraGurmukhi() {
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
    if (!(isWebkit && $("#paatth").hasClass("linebreak"))) {
      $("#"+div_id).toggle();
    } else if (ucharan == 1) {
      $("#"+div_id).toggle();
    }
  return false;
}

function setAng(set_ang, store) {
  store = typeof store !== 'undefined' ? store : true;
  //Make sure it's an Ang within the proper range or set to 1
  var set_ang = parseInt(set_ang);
  if (set_ang < 1 || set_ang > 1430) set_ang = 1;
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
    '॥ ਜਪੁ ॥',
    'ਸਲੋਕ ਵਾਰਾਂ'
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
    .replace(/\u0A72\u0A40\uF034/g,'\u0A08\uF034') // ੰ+ਈ
    .replace(/ੑੁ/g,'\uF040')
    .replace(/ੑੂ/g,'\uF041')
    .replace(/ੵੁ/g,'\uF043')
    .replace(/ੵੂ/g,'\uF044');

    var isTitleMangal = titleMangalAngList.includes(set_ang);
    var isLinebreak = $("#paatth").hasClass("linebreak");

    lines = gurbani.split('!');

    var ucharanPaath = '';
      $.each(lines, function(index,line){
        pangti = line.replace(ucharan_regex,'');

        // join hadh to look like traditional larivaar
        if (isLinebreak) {
          if (index != 0 && index != (lines.length - 1)) {
            pangti = `\uF042${pangti}`;
          }
          pangti = pangti
          .replace(' ॥', '\uF042 ॥')
          .replace('॥ ਰਹਾਉ ॥', '॥ \uF042ਰਹਾਉ\uF042 ॥')
          .replace('\uF042ੴ', 'ੴ');
        }

        mangalType = (isTitleMangal == true && index <= 1) ? '$' : '!';
        formattedPangti = `${mangalType}${pangti}${mangalType}`;
        // check for sirlekh
        if (sirlekhList.some(substring=>pangti.includes(substring))) {
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
        if (set_ang == 1) {
          if ((pangti.includes('ਆਦਿ ਸਚੁ; ਜੁਗਾਦਿ ਸਚੁ')) || (pangti.includes('ਹੈ ਭੀ ਸਚੁ; ਨਾਨਕ ਹੋਸੀ ਭੀ ਸਚੁ'))) {
            pangti = `$${pangti}$`;
          }
          if (pangti == '\uF042॥ ਜਪੁ\uF042 ॥') {
            pangti = '$॥ \uF042ਜਪੁ\uF042 ॥$';
          }
        }

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
          ucharanTip = (val.split("{")[1] ||"").split("}")[0].replace(/_/g, " ");
          firstChar = word.at(0);
          hasUcharan = true;
        }

        // linebreak mode (traditional larivaar)
        spacingPaath = ' ';
        if (isLinebreakActive) {
          numSpacing = '<span id="num_spacing">&hairsp;</span>';
          word = word
          .replace('੧\uF042', `੧${numSpacing}`)
          .replace('੨\uF042', `੨${numSpacing}`)
          .replace('੩\uF042', `੩${numSpacing}`)
          .replace('੪\uF042', `੪${numSpacing}`)
          .replace('੫\uF042', `੫${numSpacing}`)
          .replace('੬\uF042', `੬${numSpacing}`)
          .replace('੭\uF042', `੬${numSpacing}`)
          .replace('੮\uF042', `੬${numSpacing}`)
          .replace('੯\uF042', `੯${numSpacing}`)
          .replace('੦\uF042', `੦${numSpacing}`)
          .replace('\uF03D\uF042', '\uF03D')
          .replace('\uF034\uF042', '\uF034');

          if (prevWordWasMangal) {
            word = word.replace('\uF042', '');
            prevWordWasMangal = false;
          }

          spacingPaath = '&ZeroWidthSpace;';
        }

        // mangals
        spacingStart = spacingEnd = '';
        mangalSpacing = '<span id="spacing">&ensp;&ensp;&ensp;</span>';
        if (firstChar == '!') {
          spacingStart = mangalSpacing;
          word = word.replace('!\uF042', '!');
        } else if (firstChar == '$') {
          // oangkaar with larger 'kaar'; (single glyph: '\uF035')
          word = word.replace('ੴ', '\uF036\uF037'); 

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

        // sirlekh surtaal subscripts
        ucharanTip = ucharanTip
        .replace('₁₅', '')
        .replace('₁', '')
        .replace('₂', '')
        .replace('₃', '')
        .replace('₄', '')
        .replace('₅', '')
        .replace('₆', '')
        .replace('₈', '');
        word = word
        .replace('₁₅', '(੧੫)')
        .replace('₁', '(੧)')
        .replace('₂', '(੨)')
        .replace('₃', '(੩)')
        .replace('₄', '(੪)')
        .replace('₅', '(੫)')
        .replace('₆', '(੬)')
        .replace('₈', '(੮)');
        word = word.replace('(', `</${closing_tag}>${spacingPaath}<span class="sirlekh_subscript"><sub>`);
        word = word.replace(')', '</sub>');

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
    } else {
      setSehajPaathAng(ang);
    }
    setPaathBodhAngRange(ang);

    //Check for bookmark, insert it and scroll to
    if (bookmark_ang == ang && bookmark_index > -1) {
      $("#paatth *").eq(bookmark_index).after($("<i></i>").addClass("fa fa-bookmark"));
      window.scrollTo(0,$('i.fa.fa-bookmark').offset().top-58);
    } else {
      window.scrollTo(0,0);
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
    //Check for bookmark, insert it and scroll to
    if (bookmark_ang == ang && bookmark_index > -1) {
      $("#paatth *").eq(bookmark_index).after($("<i></i>").addClass("fa fa-bookmark"));
    }
  }
}

function setSehajPaathAng(ang) {
  var audioLink = `<a href="javascript:playSehajPaathAudio(${ang}, true)">Santhiya Audio Ang ${ang}</a>`;
  $("#audio_link_sp").html(audioLink);
}

function setPaathBodhAngRange(ang) {
  var section = "";
  if (ang >= 1 && ang < 388) {
    section = "0001-0388";
  } else if (ang >= 388 && ang < 807) {
    section = "0388-0807";
  } else if (ang >= 807 && ang < 1231) {
    section = "0807-1231";
  } else if (ang >= 1231 && ang < 1430) {
    section = "1231-1430";
  }

  var tracks = pb_audio.filter(function (track) {
    return track.start <= ang && track.end > ang;
  });
  var track = tracks[0];
  var range = `${track.start}-${track.end}`;
  var url = `https://www.gurmatveechar.com/audios/Gurbani_Santhya/Bhindran_Taksal_Santhya/Ang_${section}/${track.id}--Bhindran.Taksal.Santhya--Ang.${track.suffix}.mp3`;
  var audioLink = `<a href="javascript:playPaathBodhAudio('${url}', '${range}', '${ang}')">Paath Bodh Audio Angs ${range}</a>`;
  $("#audio_link_bp").html(audioLink);
}

// ang-range audio paath
function playPaathBodhAudio(url, range, ang) {
  var nowPlaying = `Paath Bodh, Angs ${range}`;
  $("#now_playing").html(nowPlaying);
  setSehajPaathAng(ang);
  isDefaultAudio = 0;
  playAudio(url, true);
}

// ang-wise audio
function playSehajPaathAudio(angNumber, autoPlay) {
  var formattedAng = String(angNumber).padStart(4, '0');
  var url = `https://media.gursevak.com/media/Sehaj_Paath_Pagewise/Sehaj_Paath_16kbps/${formattedAng}.mp3`;
  var nowPlaying = `Santhiya, Ang ${angNumber}`;
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
    if (isWebkit && $("#paatth").hasClass("linebreak")) {
      init();
    }
  });
  $(".smaller").click(function () {
    font_size -= 1;
    $("#paatth").css("font-size", font_size + "px");
    window.localStorage["font_size"] = font_size;
    if (isWebkit && $("#paatth").hasClass("linebreak")) {
      init();
    }
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
          break;
        case "ucharan":
          $("#paatth").addClass(setting);
          ucharan = 1;
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
        case "keep_awake":
          window.plugins.insomnia.keepAwake();
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
          break;
        case "ucharan":
          $("#paatth").removeClass(setting);
          ucharan = 0;
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
        case "keep_awake":
          window.plugins.insomnia.allowSleepAgain();
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
          $("#bold_font_setting").click();
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

var pb_audio = [
  {"id": "002", "suffix": "1-8", "start": 1, "end": 8},
  {"id": "004", "suffix": "8-19", "start": 8, "end": 19},
  {"id": "005", "suffix": "19-21", "start": 19, "end": 21},
  {"id": "006", "suffix": "21-23", "start": 21, "end": 23},
  {"id": "007", "suffix": "23-36", "start": 23, "end": 36},
  {"id": "008", "suffix": "36-46.%26.Q.and.A", "start": 36, "end": 46},
  {"id": "009", "suffix": "46-56", "start": 46, "end": 56},
  {"id": "010", "suffix": "56-64", "start": 56, "end": 64},
  {"id": "011", "suffix": "64-79", "start": 64, "end": 79},
  {"id": "012", "suffix": "79-81", "start": 79, "end": 81},
  {"id": "013", "suffix": "81-98", "start": 81, "end": 98},
  {"id": "014", "suffix": "98-100", "start": 98, "end": 100},
  {"id": "015", "suffix": "100-114", "start": 100, "end": 114},
  {"id": "016", "suffix": "114-126", "start": 114, "end": 126},
  {"id": "018", "suffix": "126-140", "start": 126, "end": 140},
  {"id": "019", "suffix": "140-150", "start": 140, "end": 150},
  {"id": "020", "suffix": "151-166", "start": 151, "end": 166},
  {"id": "021", "suffix": "166-176", "start": 166, "end": 176},
  {"id": "023", "suffix": "176-179", "start": 176, "end": 179},
  {"id": "024", "suffix": "189-190", "start": 189, "end": 190},
  {"id": "026", "suffix": "193-204", "start": 193, "end": 204},
  {"id": "027", "suffix": "204-209", "start": 204, "end": 209},
  {"id": "029", "suffix": "210-223", "start": 210, "end": 223},
  {"id": "030", "suffix": "223-235", "start": 223, "end": 235},
  {"id": "031", "suffix": "235-245", "start": 235, "end": 245},
  {"id": "032", "suffix": "245-250", "start": 245, "end": 250},
  {"id": "033", "suffix": "250-258", "start": 250, "end": 258},
  {"id": "034", "suffix": "258-259", "start": 258, "end": 259},
  {"id": "035", "suffix": "259-263", "start": 259, "end": 263},
  {"id": "036", "suffix": "263-275", "start": 263, "end": 275},
  {"id": "037", "suffix": "275-286", "start": 275, "end": 286},
  {"id": "038", "suffix": "286-301", "start": 286, "end": 301},
  {"id": "039", "suffix": "301-317", "start": 301, "end": 317},
  {"id": "040", "suffix": "317-318", "start": 317, "end": 318},
  {"id": "041", "suffix": "318-327", "start": 318, "end": 327},
  {"id": "042", "suffix": "327-331", "start": 327, "end": 331},
  {"id": "043", "suffix": "331-340", "start": 331, "end": 340},
  {"id": "044", "suffix": "340-346", "start": 340, "end": 346},
  {"id": "045", "suffix": "347-362", "start": 347, "end": 362},
  {"id": "046", "suffix": "362", "start": 362, "end": 362},
  {"id": "047", "suffix": "362-376", "start": 362, "end": 376},
  {"id": "049", "suffix": "376-388", "start": 376, "end": 388},
  {"id": "050", "suffix": "388-400", "start": 388, "end": 400},
  {"id": "051", "suffix": "400-416", "start": 400, "end": 416},
  {"id": "052", "suffix": "416-434", "start": 416, "end": 434},
  {"id": "053", "suffix": "434-449", "start": 434, "end": 449},
  {"id": "054", "suffix": "449-462", "start": 449, "end": 462},
  {"id": "056", "suffix": "465-473", "start": 462, "end": 465},
  {"id": "057", "suffix": "473-477", "start": 465, "end": 473},
  {"id": "058", "suffix": "477-478", "start": 473, "end": 477},
  {"id": "059", "suffix": "478-488", "start": 477, "end": 478},
  {"id": "060", "suffix": "489-503", "start": 478, "end": 488},
  {"id": "061", "suffix": "503-515", "start": 489, "end": 503},
  {"id": "062", "suffix": "515-517", "start": 515, "end": 517},
  {"id": "063", "suffix": "517-528", "start": 517, "end": 528},
  {"id": "064", "suffix": "528-541", "start": 528, "end": 541},
  {"id": "066", "suffix": "541-555", "start": 541, "end": 555},
  {"id": "067", "suffix": "555-570", "start": 555, "end": 570},
  {"id": "068", "suffix": "570-584", "start": 570, "end": 584},
  {"id": "069", "suffix": "584-598", "start": 584, "end": 598},
  {"id": "070", "suffix": "598-610", "start": 598, "end": 610},
  {"id": "071", "suffix": "610-620", "start": 610, "end": 620},
  {"id": "072", "suffix": "620-625", "start": 620, "end": 625},
  {"id": "073", "suffix": "625-644", "start": 625, "end": 644},
  {"id": "074", "suffix": "644-656", "start": 644, "end": 656},
  {"id": "076", "suffix": "656-666", "start": 656, "end": 666},
  {"id": "077", "suffix": "666-675", "start": 666, "end": 675},
  {"id": "078", "suffix": "675-678", "start": 675, "end": 678},
  {"id": "079", "suffix": "678-694", "start": 678, "end": 694},
  {"id": "080", "suffix": "694-705", "start": 694, "end": 705},
  {"id": "082", "suffix": "705-717", "start": 705, "end": 717},
  {"id": "083", "suffix": "718-727", "start": 718, "end": 727},
  {"id": "084", "suffix": "728-733", "start": 728, "end": 733},
  {"id": "085", "suffix": "733-737", "start": 733, "end": 737},
  {"id": "086", "suffix": "737-739", "start": 737, "end": 739},
  {"id": "087", "suffix": "739-753", "start": 739, "end": 753},
  {"id": "088", "suffix": "753-766", "start": 753, "end": 766},
  {"id": "089", "suffix": "766-778", "start": 766, "end": 778},
  {"id": "090", "suffix": "778-790", "start": 778, "end": 790},
  {"id": "091", "suffix": "790-793", "start": 790, "end": 793},
  {"id": "093", "suffix": "793-807", "start": 793, "end": 807},
  {"id": "094", "suffix": "807-820", "start": 807, "end": 820},
  {"id": "095", "suffix": "820-831", "start": 820, "end": 831},
  {"id": "096", "suffix": "831-844.%26.Q.and.A", "start": 831, "end": 844},
  {"id": "097", "suffix": "844-858", "start": 844, "end": 858},
  {"id": "098", "suffix": "859-875", "start": 859, "end": 875},
  {"id": "099", "suffix": "876-893", "start": 876, "end": 893},
  {"id": "100", "suffix": "893-906", "start": 893, "end": 906},
  {"id": "103", "suffix": "906-920", "start": 906, "end": 920},
  {"id": "104", "suffix": "920-934", "start": 920, "end": 934},
  {"id": "105", "suffix": "934-942", "start": 934, "end": 942},
  {"id": "106", "suffix": "942-946", "start": 942, "end": 946},
  {"id": "107", "suffix": "947-956", "start": 947, "end": 956},
  {"id": "108", "suffix": "957-960", "start": 957, "end": 960},
  {"id": "110", "suffix": "960-974", "start": 960, "end": 974},
  {"id": "111", "suffix": "975-989", "start": 975, "end": 989},
  {"id": "112", "suffix": "990-1006", "start": 990, "end": 1006},
  {"id": "113", "suffix": "1006-1018", "start": 1006, "end": 1018},
  {"id": "114", "suffix": "1018-1030", "start": 1018, "end": 1030},
  {"id": "115", "suffix": "1030-1049", "start": 1030, "end": 1049},
  {"id": "116", "suffix": "1049-1054", "start": 1049, "end": 1054},
  {"id": "118", "suffix": "1054-1067", "start": 1054, "end": 1067},
  {"id": "119", "suffix": "1067-1080", "start": 1067, "end": 1080},
  {"id": "120", "suffix": "1080-1096", "start": 1080, "end": 1096},
  {"id": "121", "suffix": "1096-1106", "start": 1096, "end": 1106},
  {"id": "123", "suffix": "1107-1119", "start": 1107, "end": 1119},
  {"id": "124", "suffix": "1119-1130", "start": 1119, "end": 1130},
  {"id": "125", "suffix": "11301144", "start": 1130, "end": 1144},
  {"id": "126", "suffix": "1144-1150.%26.Q.and.A", "start": 1144, "end": 1150},
  {"id": "127", "suffix": "1150-1162", "start": 1150, "end": 1162},
  {"id": "128", "suffix": "1162-1170", "start": 1162, "end": 1170},
  {"id": "129", "suffix": "1171-1183", "start": 1171, "end": 1183},
  {"id": "130", "suffix": "1183-1191", "start": 1183, "end": 1191},
  {"id": "132", "suffix": "1191-1203", "start": 1191, "end": 1203},
  {"id": "133", "suffix": "1203-1212", "start": 1203, "end": 1212},
  {"id": "134", "suffix": "1212-1231", "start": 1212, "end": 1231},
  {"id": "135", "suffix": "1231-1233.%26.Q.and.A", "start": 1231, "end": 1233},
  {"id": "136", "suffix": "1233-1242", "start": 1233, "end": 1242},
  {"id": "137", "suffix": "1242-1251", "start": 1242, "end": 1251},
  {"id": "138", "suffix": "1251-1262", "start": 1251, "end": 1262},
  {"id": "139", "suffix": "1262-1265", "start": 1262, "end": 1265},
  {"id": "141", "suffix": "1276-1282", "start": 1276, "end": 1282},
  {"id": "142", "suffix": "1282-1291", "start": 1282, "end": 1291},
  {"id": "143", "suffix": "1291-1295", "start": 1291, "end": 1295},
  {"id": "144", "suffix": "1295-1305", "start": 1295, "end": 1305},
  {"id": "145", "suffix": "1305-1319", "start": 1305, "end": 1319},
  {"id": "146", "suffix": "1319-1323", "start": 1319, "end": 1323},
  {"id": "147", "suffix": "1323-1330", "start": 1323, "end": 1330},
  {"id": "148", "suffix": "1330-1343", "start": 1330, "end": 1343},
  {"id": "149", "suffix": "1343-1353", "start": 1343, "end": 1353},
  {"id": "151", "suffix": "1353-1354", "start": 1353, "end": 1354},
  {"id": "152", "suffix": "1354-1360", "start": 1354, "end": 1360},
  {"id": "153", "suffix": "1360-1361", "start": 1360, "end": 1361},
  {"id": "154", "suffix": "1361-1371", "start": 1361, "end": 1371},
  {"id": "155", "suffix": "1371-1374", "start": 1371, "end": 1374},
  {"id": "156", "suffix": "1374-1375", "start": 1374, "end": 1375},
  {"id": "158", "suffix": "1375-1386", "start": 1375, "end": 1386},
  {"id": "159", "suffix": "1386-1390", "start": 1386, "end": 1390},
  {"id": "160", "suffix": "1391-1398", "start": 1391, "end": 1398},
  {"id": "161", "suffix": "1398-1401", "start": 1398, "end": 1401},
  {"id": "162", "suffix": "1401-1406", "start": 1401, "end": 1406},
  {"id": "164", "suffix": "1406-1421", "start": 1406, "end": 1421},
  {"id": "166", "suffix": "1421-1429", "start": 1421, "end": 1429},
  {"id": "167", "suffix": "1429-1430", "start": 1429, "end": 1430},
];