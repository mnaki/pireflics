currentPage = 1

window.onload = ->
  populateList = (movies) ->
    $.each movies, (key, val) ->
      if val.id
        $.ajax
          url: '/movie/partial/'+val.id
          success: (partialData) ->
            $('.video-list').append partialData
          error: (err) ->
            # console.log err

  getForm = ->
    {
      sortBy: $('#sortBy').val(),
      order: $('#order').val(),
      page: currentPage,
      yearFrom: $('#yearFrom').val(),
      yearTo: $('#yearTo').val(),
    }

  search = (searchText) ->
    try
      if $('.searchform .movieName').val() == ''
        $.ajax
          url: '/movie/popular'
          data: getForm()
          success: (movies) -> populateList movies
          error: (err) ->
            # console.log err
      else
        $.ajax
          url: '/movie/search/' + searchText
          data: getForm()
          success: (movies) -> populateList movies
          error: (err) ->
            # console.log err
    catch error
      # console.log error

  $('.searchform').submit (e) ->
    currentPage = 1
    $('.video-list').html ''
    search $('.searchform .movieName').val()
    return false

  @nextPage = ->
    currentPage = currentPage + 1
    search $('.searchform .movieName').val()

  $(window).scroll _.throttle(->
    if $(window).scrollTop() + $(window).height() > $(document).height() - 80
      nextPage()
  , 3000)

  onUserInput = ->
    $('.video-list').html ''
    $('.searchform .movieName').submit()

  # $('.searchform .movieName').keyup _.throttle(onUserInput, 3000)
  $('.searchform').change onUserInput

  search('')
