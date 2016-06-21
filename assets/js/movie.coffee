currentPage = 1
itemPerPage = 5

window.onload = ->
  populateList = (movies) ->
    $.each movies, (key, val) ->
      # console.log val
      $.ajax
        url: '/movie/partial'
        data: data: val
        success: (partialData) ->
          $('.video-list').append partialData

  search = (searchText) ->
    $.getJSON '/movie/search/' + searchText, { page: currentPage, itemPerPage: itemPerPage}, (movies) ->
      # console.log(movies)
      populateList movies


  $('.searchform').submit (e) ->
    currentPage = 1
    itemPerPage = 5
    $('.video-list').html ''
    $textBox = $('.searchform .movieName')
    # console.log $textBox.val()
    search $textBox.val()
    return false

  $.getJSON '/movie/popular', (movies) ->
    # console.log(movies)
    $('.video-list').html ''
    populateList movies

  $(window).scroll ->
    if $(window).scrollTop() + $(window).height() > $(document).height() - 5
      console.log 'bottom'
      currentPage = currentPage + 1
      search $('.searchform .movieName')
