currentPage = 1
itemPerPage = 5

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
      $('select').each((i, e) -> $(e).attr('disabled', ''))
      $.getJSON '/movie/popular', {page: currentPage, itemPerPage: itemPerPage}, (movies) ->
        populateList movies
    else
      $('select').each((i, e) -> $(e).removeAttr('disabled'))
    $.getJSON '/movie/search/' + searchText, {
      sortBy: $('#sortby').val(),
      order: $('#order').val(),
      page: currentPage,
      itemPerPage: itemPerPage
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
  , 1500, trailing: true)

  onUserInput = ->
    $('.video-list').html ''
    $('.searchform .movieName').submit()

  $('.searchform .movieName').keyup _.throttle(onUserInput, 1500, trailing: true)
  $('.searchform').change onUserInput

  search()
