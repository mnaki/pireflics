currentPage = 1
itemPerPage = 5
currentSearch = ''
currentSort = ''

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
      $.getJSON '/movie/popular', {page: currentPage, itemPerPage: itemPerPage}, (movies) ->
        populateList movies
    $.getJSON '/movie/search/' + searchText, {
      sortBy: $('#order').val(),
      order: $('#ascdesc').val(),
      page: currentPage,
      itemPerPage: itemPerPage
      }, (movies) ->
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
      nextPage()
  , 500, trailing: true)

  onUserInput = ->
    # if $('.searchform .movieName').val() == currentSearch && currentSort == $('#order').val()
    #   return
    currentSearch = $('.searchform .movieName').val()
    currentSort = $('#order').val()
    $('.video-list').html ''
    $('.searchform .movieName').submit()

  $('.searchform .movieName').keyup _.throttle(onUserInput, 500, trailing: true)
  $('.searchform').change onUserInput

  search()
