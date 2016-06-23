currentPage = 1
itemPerPage = 5
currentSearch = ''

window.onload = ->
  populateList = (movies) ->
    $.each movies, (key, val) ->
      $.ajax
        url: '/movie/partial'
        data: { page: currentPage, itemPerPage: itemPerPage, data: val }
        success: (partialData) ->
          $('.video-list').append partialData

  search = (searchText) ->
    if $('.searchform .movieName').val() == ''
      $.getJSON '/movie/popular', { page: currentPage, itemPerPage: itemPerPage}, (movies) ->
        populateList movies
    $.getJSON '/movie/search/' + searchText, { page: currentPage, itemPerPage: itemPerPage}, (movies) ->
      # console.log(movies)
      populateList movies

  $('.searchform').submit (e) ->
    currentPage = 1
    itemPerPage = 5
    $('.video-list').html ''
    search $('.searchform .movieName').val()
    return false

  @nextPage = ->
    currentPage = currentPage + 1
    search $('.searchform .movieName').val()

  $(window).scroll _.throttle(->
    if $(window).scrollTop() + $(window).height() > $(document).height() - 100
      console.log 'bottom'
      nextPage()
  , 500, trailing: true)

  $('.searchform .movieName').keyup _.throttle(->
    if $('.searchform .movieName').val() == currentSearch
      return
    currentSearch = $('.searchform .movieName').val()
    console.log 'change'
    $('.video-list').html ''
    $('.searchform .movieName').submit()
  , 500, trailing: true)

  search()
