$(window).on("load", function() {
    // Check if user is logged into MetaMask when the page loads and display results
    pollForUser();
    // The form to create a new token/coin has been submitted, process and create a new token/coin
    $("#createForm").on('submit', function(e){
        e.preventDefault(); // Prevent default form actions from occuring
        var coinData = $("#createForm :input").serializeArray();    // Gather all the form input and serialize
        returnUser(function(user){
            if (user){
                // Validate the input, if validation fails clear fields and display errors
                validateCoinInput(coinData, function(error, processedData){
                    if(error){
                        return;
                    }
                    // After validation, display confirmation modal
                    $('.modal-body').html(
                        "<p>Token Name: " + processedData.tokenName + "</p>" +
                        "<p>Token Symbol: " + processedData.tokenSymbol + "</p>" +
                        "<p>Amount to create: " + processedData.initialAmount + "</p>" +
                        "<p>Decimal places to divide into: " + processedData.decimalUnits + "</p>" +
                        "<p>Connected to network: " + getNetwork(user.network) + "</p>" +
                        "<p>Account address: " + user.address + "</p>"
                    );
                    $('#confirmationModal').modal('show');
                    modalConfirmation(function(confirmationResult){
                        if(confirmationResult){
                            // Create actual coin with creationAccount, initialAmount, tokenName, decimalUnits, tokenSymbol
                            createCoin(user.address, processedData.initialAmount, processedData.tokenName, processedData.decimalUnits, processedData.tokenSymbol, function(contract){
                                if (!contract){
                                    // User didn't approve transaction
                                    return;
                                } else{
                                    // Redirect to the page to wait for the coin to be mined
                                    window.location = "/tx/" + contract.transactionHash;
                                }
                            });
                        } else{
                            // Let the user try again
                        }
                    })
                });
            }
            else{
                alert("Cannot find MetaMask to create token, try again later");
            }
        });
    });

    // Prevent negative numbers
    $('#inputDecimals').keydown(function(event) {
      if(!((event.keyCode > 95 && event.keyCode < 106)
          || (event.keyCode > 47 && event.keyCode < 58)
          || event.keyCode == 8)) {
            return false;
        }
    });

    // Add commas to inputAmount box
    $('#inputDecimals').keyup(function(event) {
      inputNum = $(this).val();
      if (inputNum > 18){
          $('#decimalWarning').show();
      } else{
          $('#decimalWarning').hide();
      }

      if (inputNum > 255){
          console.log(inputNum);
          console.log(inputNum/10);
          return $(this).val(Math.floor(inputNum/10));
      }

    });

    // Add commas to inputAmount box
    $('#inputAmount').keyup(function(event) {

      // skip for arrow keys
      if(event.which >= 37 && event.which <= 40) return;

      // format number
      $(this).val(function(index, value) {
        return value
        .replace(/\D/g, "")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        ;
      });
    });
});
