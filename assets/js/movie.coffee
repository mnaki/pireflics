currentPage = 1

window.onload = ->
  populateList = (movies) ->
    $.each movies, (key, val) ->
      console.log val
      $.ajax
        url: '/movie/partial/'+val.id
        success: (partialData) ->
          $('.video-list').append partialData

  search = (searchText) ->
    if $('.searchform .movieName').val() == ''
      $.getJSON '/movie/popular', {page: currentPage }, (movies) ->
        populateList movies
    $.getJSON '/movie/search/' + searchText, {
      sortBy: $('#sortby').val(),
      order: $('#order').val(),
      page: currentPage
      }, (movies) ->
      populateList movies

  $('.searchform').submit (e) ->
    currentPage = 1
    $('.video-list').html ''
    search $('.searchform .movieName').val()
    return false

  @nextPage = ->
    currentPage = currentPage + 1
    search $('.searchform .movieName').val()

  $(window).scroll _.throttle(->
    if $(window).scrollTop() + $(window).height() > $(document).height() - 100
      nextPage()
  , 3000)

  onUserInput = ->
    $('.video-list').html ''
    $('.searchform .movieName').submit()

  $('.searchform .movieName').keyup _.throttle(onUserInput, 3000)
  $('.searchform').change onUserInput

  search('')
