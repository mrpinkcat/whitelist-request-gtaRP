/* global io $ Notification */

var socket = io(),
  currentPage,
  ipWaiting = 0,
  ipAccepted = 0;

$(document).ready(function() {
  socket.emit('admin-connect');
  setTimeout(function() {
    $('.loading').fadeOut(function() {
      if (window.Notification && Notification.permission == "granted") {
        $('.choice').fadeIn();
        return;
      }
      if (window.Notification && Notification.permission == "denied") {
        $('.choice').fadeIn();
        return;
      }
      else {
        $('.req-perm').fadeIn();
        return;
      }
    });
  }, 1000);
});

function actionId(id, res) {
  if (res == 'remove')
    socket.emit('remove-id-db', id);
  if (res == 'denie')
    socket.emit('denie-id-db', id);
  if (res == 'ok')
    socket.emit('ok-id-db', id);
}

function addRequest(ip, exp) {
  $('#table').prepend('<tr id="' + ip + '">' +
    '<td>' + ip + '</td>' +
    '<td>' + exp + '</td>' +
    '<td class="text-center"><div class="btn btn-success" onclick="actionId(\'' + ip + '\', \'ok\')"><i class="fa fa-check"></i></div><div class="btn btn-danger" onclick="actionId(\'' + ip + '\', \'denie\')"><i class="fa fa-times"></i></div></td>' +
    '</tr>');
  ipWaiting++;
}

function addAccepted(ip, exp) {
  $('#table-accepted').prepend('<tr id="' + ip + '">' +
    '<td>' + ip + '</td>' +
    '<td>' + exp + '</td>' +
    '<td class="text-center"><div class="btn btn-danger" onclick="actionId(\'' + ip + '\', \'remove\')"><i class="fa fa-times"></i></div></td>' +
    '</tr>');
  ipAccepted++;
}

$('.retrun-btn').click(function() {
  $('.' + currentPage).fadeOut(500, function() {
    $('.choice').fadeIn(500);
  });
  currentPage = undefined;
});

$('#waiting-btn').click(function() {
  $('.choice').fadeOut(500, function() {
    $('.waiting').fadeIn(500);
  });
  currentPage = 'waiting';
});

$('#accepted-btn').click(function() {
  $('.choice').fadeOut(500, function() {
    $('.accepted').fadeIn(500);
  });
  currentPage = 'accepted';
})

$('#conf-btn').click(function() {
  $('.choice').fadeOut(500, function() {
    $('.conf').fadeIn(500);
  });
  currentPage = 'conf';
});

$('#req-perm').click(function() {
  Notification.requestPermission(function(status) {
    if (Notification.permission !== status)
      Notification.permission = status;
    if (status === "granted") {
      $('.req-perm').fadeOut(function() {
        $('.choice').fadeIn();
      });
    }
    else {
      $('.req-perm').fadeOut(function() {
        $('.choice').fadeIn();
      });
    }
  });
});

$('#save-btn').click(function() {
  var recaptchaCheckbox;
  if ($('#recaptcha-checkbox:checked').val() == 'on')
    recaptchaCheckbox = true;
  else
    recaptchaCheckbox = false;

  var data = {
    "recaptcha": recaptchaCheckbox,
    "server-name": $('#server-name-textarea').val(),
    "server-ip": $('#server-ip-textarea').val(),
    "requirement": $('#requirement-textarea').val()
  };
  socket.emit('db-push', data);
  socket.on('db-push-ok', function() {
    alert('Vos changements ont bien été enregistrés');
  });
});

socket.on('send-db', function(data, recaptcha, serverName, serverIp, requirement) {
  $.each(data, function(key, value) {
    if (value.status == 'waiting') {
      addRequest(value.ip, value.exp);
    }
    if (value.status == 'accepted') {
      addAccepted(value.ip, value.exp);
    }
  });
  if (recaptcha)
    $('#recaptcha-checkbox').attr('checked', 'checked');
  $('#server-name-textarea').text(serverName);
  $('#server-ip-textarea').text(serverIp);
  $('#requirement-textarea').text(requirement);
  console.info('Config infos loaded !\nreCAPTCHA : ' + recaptcha + '\nServer name : ' + serverName + '\nServer IP : ' + serverIp + '\nRequirement : ' + requirement);
  if (ipWaiting === 0)
    $('#whitelist-list').hide(function() {
      $('#whitelist-none').show();
    });
});

socket.on('notif-admin', function() {
  var n = new Notification("Nouvelle demande de whitelist !", {
    icon: 'panel/img/notif.png'
  });
});

socket.on('add-req', function(ip, exp) {
  addRequest(ip, exp);
  if (currentPage == 'waiting')
    $('#whitelist-none').fadeOut(500, function() {
      $('#whitelist-list').fadeIn(500);
    });
  else
    $('#whitelist-none').hide(function() {
      $('#whitelist-list').show();
    });
});

socket.on('remove-id-panel', function(id) {
  var x = document.getElementById(id);
  x.remove();
  ipWaiting--;
  if (ipWaiting === 0)
    $('#whitelist-list').fadeOut(500, function() {
      $('#whitelist-none').fadeIn(500);
    });
});
