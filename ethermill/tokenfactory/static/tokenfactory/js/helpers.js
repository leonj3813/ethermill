/*
 * Attempts to find what user is logged in to MetaMask
 * If no user is found, keep checking every second until a user if found.
 * If user is found, display the user and network in the metamask-account div and
 * continue to check for user changes every 3 seconds.
*/
function pollForUser(callback){
    returnUser(function(user){
        if (user){
            // Metamask user found
            // Set page variable
            var user = user;
            // Hide the error alert, display message, show info alert, and enable buttons
            $(".metamask-alert").hide();
            $(".metamask-account").html(getNetworkMessage(user.address, user.network));
            $(".metamask-account").show();
            $("input").prop('disabled', false);
            $("#createCoinButton").prop('disabled', false);
            setTimeout(function() {pollForUser()}, 3000);   // Poll for user changes
        } else{
            // No user found
            // Keep the error alert and change the text, keep checking because sometimes MetaMask takes a while to load
            $(".metamask-alert").html("Warning: You don't appear to be logged into MetaMask, this is required to create a token. Log in or get MetaMask here");
            setTimeout(function() {pollForUser()}, 1000);
        }
    });
};

/*
 * Return callback with User object. If null, user not found.
 * user.network = number value of network Connected
 * user.address = account address of user
*/
function returnUser(callback){
    if (typeof web3 !== 'undefined') {
        var localWeb3 = new Web3(web3.currentProvider);
        if (localWeb3.currentProvider.isMetaMask === true) {    // Make sure MetaMask is being injected into webpage
            if (typeof localWeb3.eth.defaultAccount === 'undefined') {
                return callback(null);  // If no account found, return null
            } else{
                localWeb3.eth.getAccounts(function(error, accounts){
                    if (error)
                        return callback(null);
                    localWeb3.version.getNetwork(function(err, netId){
                      if (err)
                        return callback(null);
                      return callback({"address" : accounts[0], "network" : netId});
                  });
              });
            }
        } else{
            return callback(null);
        }
    } else{
        return callback(null);
    }
}

/*
 * Process and validate the form input before trying to create a new token
 * Return true if validation fails
 * Return the formatted data if validation is successful
*/
function validateCoinInput(data, callback){
    var tokenName = data[0].value;
    var tokenSymbol = data[1].value;
    var initialAmount = data[2].value;
    var decimalUnits = data[3].value;

    initialAmount = new BigNumber(initialAmount.replace(/,/g, '')); // Replace commas in the Amount
    decimalUnits = parseInt(decimalUnits);

    // Make sure fields that require numbers are actually numbers and are not out of range
    if (isNaN(initialAmount) || isNaN(decimalUnits) || decimalUnits > 255){
        $('#validationError').html("Error validating number values");
        $('#validationError').show();
        $('#inputAmount').val('');
        $('#inputDecimals').val('');
        return callback(true);
    }

    // Reformat the total tokens
    var totalTokens = initialAmount.times(new BigNumber(10).pow(decimalUnits));

    var max_255 = new BigNumber(2).pow(256).minus(1);

    // Make sure initial amount can fit into 256 bit Integer
    if (totalTokens.gte(max_255)){
        $('#validationError').html("Combination of initial amount and decimal units exceeds max limits.");
        $('#validationError').show();
        $('#inputAmount').val('');
        $('#inputDecimals').val('');
        return callback(true);
    }

    processedData = {
        tokenName : tokenName,
        tokenSymbol : tokenSymbol,
        initialAmount : initialAmount,
        decimalUnits : decimalUnits
    }
    // Return the processed/validated data
    return callback(false, processedData);
}

/*
 * Return the result of the modal.
 * Return true if the user clicks create, and return false if the user clicks cancel
*/
function modalConfirmation(callback){
    $("#confirmationCreate").on("click", function(){
      callback(true);
      $("#confirmationModal").modal('hide');
    });
    $("#confirmationCancel").on("click", function(){
        callback(false);
    $("#confirmationModal").modal('hide');
    });
};

/*
 * Uses web3.js library to create a new coin contract, return the coin contract object in a callback
 * Input arguments: uint256 _initialAmount, string _tokenName, uint8 _decimalUnits, string _tokenSymbol
*/
function createCoin(creationAccount, initialAmount, tokenName, decimalUnits, tokenSymbol, callback){
    // Reformat the initial amount
    initialAmount = initialAmount.times(new BigNumber(10).pow(decimalUnits));
    // Actual contract to be created
    var erc20Contract = web3.eth.contract([{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balances","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowed","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_initialAmount","type":"uint256"},{"name":"_tokenName","type":"string"},{"name":"_decimalUnits","type":"uint8"},{"name":"_tokenSymbol","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}]);
    var erc20 = erc20Contract.new(
       initialAmount,
       tokenName,
       decimalUnits,
       tokenSymbol,
       {
         from: creationAccount,
         data: '0x6060604052341561000f57600080fd5b6040516107ae3803806107ae833981016040528080519190602001805182019190602001805191906020018051600160a060020a03331660009081526001602052604081208790558690559091019050600383805161007292916020019061009f565b506004805460ff191660ff8416179055600581805161009592916020019061009f565b505050505061013a565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106100e057805160ff191683800117855561010d565b8280016001018555821561010d579182015b8281111561010d5782518255916020019190600101906100f2565b5061011992915061011d565b5090565b61013791905b808211156101195760008155600101610123565b90565b610665806101496000396000f3006060604052600436106100ae5763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166306fdde0381146100b3578063095ea7b31461013d57806318160ddd1461017357806323b872dd1461019857806327e235e3146101c0578063313ce567146101df5780635c6581651461020857806370a082311461022d57806395d89b411461024c578063a9059cbb1461025f578063dd62ed3e14610281575b600080fd5b34156100be57600080fd5b6100c66102a6565b60405160208082528190810183818151815260200191508051906020019080838360005b838110156101025780820151838201526020016100ea565b50505050905090810190601f16801561012f5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b341561014857600080fd5b61015f600160a060020a0360043516602435610344565b604051901515815260200160405180910390f35b341561017e57600080fd5b6101866103b0565b60405190815260200160405180910390f35b34156101a357600080fd5b61015f600160a060020a03600435811690602435166044356103b6565b34156101cb57600080fd5b610186600160a060020a03600435166104bc565b34156101ea57600080fd5b6101f26104ce565b60405160ff909116815260200160405180910390f35b341561021357600080fd5b610186600160a060020a03600435811690602435166104d7565b341561023857600080fd5b610186600160a060020a03600435166104f4565b341561025757600080fd5b6100c661050f565b341561026a57600080fd5b61015f600160a060020a036004351660243561057a565b341561028c57600080fd5b610186600160a060020a036004358116906024351661060e565b60038054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561033c5780601f106103115761010080835404028352916020019161033c565b820191906000526020600020905b81548152906001019060200180831161031f57829003601f168201915b505050505081565b600160a060020a03338116600081815260026020908152604080832094871680845294909152808220859055909291907f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9259085905190815260200160405180910390a350600192915050565b60005481565b600160a060020a0380841660008181526002602090815260408083203390951683529381528382205492825260019052918220548390108015906103fa5750828110155b151561040557600080fd5b600160a060020a038085166000908152600160205260408082208054870190559187168152208054849003905560001981101561046a57600160a060020a03808616600090815260026020908152604080832033909416835292905220805484900390555b83600160a060020a031685600160a060020a03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8560405190815260200160405180910390a3506001949350505050565b60016020526000908152604090205481565b60045460ff1681565b600260209081526000928352604080842090915290825290205481565b600160a060020a031660009081526001602052604090205490565b60058054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561033c5780601f106103115761010080835404028352916020019161033c565b600160a060020a033316600090815260016020526040812054829010156105a057600080fd5b600160a060020a033381166000818152600160205260408082208054879003905592861680825290839020805486019055917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9085905190815260200160405180910390a350600192915050565b600160a060020a039182166000908152600260209081526040808320939094168252919091522054905600a165627a7a72305820091ea5bbe516fff425740439e89a445f7c6cf6283bc44d1b4a5608cb3c8cbe670029',
         gas: '700000'
     },
     function (e, contract){
         callback(contract);
    });
}
/*
 * Return a string to display to the user which ethereum network they are connected to based on the input of the network id.
*/
function getNetworkMessage(accountAddress, networkId){
    switch (networkId) {
      case "1":
          return "You are logged into account " + accountAddress + " on the main Ethereum network, if this is not correct switch accounts and refresh this page.";
        break
      case "2":
          return true, "You are logged into account " + accountAddress + " on the deprecated Morden test network, if this is not correct switch accounts and refresh this page.";
        break
      case "3":
          return "You are logged into account " + accountAddress + " on the the Ropsten test network, if this is not correct switch accounts and refresh this page.";
        break
      default:
          return "You are logged into account " + accountAddress + " on an unknown Ethereum network, if this is not correct switch accounts and refresh this page.";
    }
}

/*
 * Return a string of the ethereum network based on the networkId
*/
function getNetwork(networkId){
    switch (networkId) {
      case "1":
          return "Main Ethereum";
        break
      case "2":
          return "deprecated Morden test network";
        break
      case "3":
          return "Ropsten test network";
        break
      default:
          return "Unknown Ethereum network";
    }
}

/*
 * Return a string on where the user can view their ethereum token based on the network id.
*/
function networkString(network_id, contractAddress, callback){
    switch (network_id) {
      case "1":
          return "View your token here <a href='https://etherscan.io/token/" + contractAddress + "'>https://etherscan.io/token/" + contractAddress + "</a>";
        break
      case "2":
          return "";
        break
      case "3":
          return "View your token here <a href='https://ropsten.etherscan.io/token/" + contractAddress + "'>https://ropsten.etherscan.io/token/" + contractAddress + "</a>";
        break
      case "4":
          return "View your token here <a href='https://rinkeby.etherscan.io/token/" + contractAddress + "'>https://rinkeby.etherscan.io/token/" + contractAddress + "</a>";
      case "42":
          return "View your token here <a href='https://kovan.etherscan.io/token/" + contractAddress + "'>https://kovan.etherscan.io/token/" + contractAddress + "</a>";
      default:
          return "";
    }
}

/*
 * Given an ethereum transaction hash use metamask to see if the transaction has been mined yet.
 * If the transaction is not found, wait a second and check until found
 * When transaction is found, display the url where the user can view the transaction.
*/
function pollForTransaction(tx_hash){
    returnUser(function(user){
        if (user){
            // If the user is logged in, hide the error alert, display message, show the info alert, and set the button enabled
            $(".metamask-alert").hide();
            $(".metamask-account").html(getNetworkMessage(user.address, user.network));
            $(".metamask-account").show();
            web3.eth.getTransaction(tx_hash, function(error, txdata){
                if (!txdata){
                    // Invalid transaction
                    $("#createdToken").html("<p>Error, can't find transaction, try a diffferent address or network.</p>");
                }
                else if (txdata.blockNumber){
                    // contract was mined
                    web3.eth.getTransactionReceipt(tx_hash, function(error, txreceipt){
                        if (!txreceipt){
                            // Can't get receipt yet, try again
                            setTimeout(function() {pollForTransaction(tx_hash)}, 1000);
                        } else{
                            if (txreceipt.status == 1){
                                // Check and see if this was a contract creation
                                if (txreceipt.contractAddress){
                                    // Transaction succeeded
                                    $("#createdToken").html("<p>Your token has been created</p> <p>It's address is " + txreceipt.contractAddress + ".</p> <p>" + networkString(user.network, txreceipt.contractAddress) + "</p>");
                                } else{
                                    $("#createdToken").html("<p>This doesn't seem to be a token transaction hash, please try a different transaction</p>");
                                }

                            } else{
                                // Transaction failed
                                $("#createdToken").html("<p>Contract creation failed</p>")
                            }
                        }
                    });
                } else{
                    // Keep looking
                    $("#createdToken").html("<p>Your token creation is pending. This page will update when it is created or you can come back to this page to check on the status.</p>")
                    setTimeout(function() {pollForTransaction(tx_hash)}, 1000);
                }
            });
        } else{
            // The user isn't logged in. Keep the error alert and change the text, keep looking for user because sometimes metamask takes time to load
            $(".metamask-alert").html("Warning: You don't appear to be logged into MetaMask, this is required to create a token. Log in or get MetaMask here");
            setTimeout(function() {pollForTransaction(tx_hash)}, 1000);
        }
    });
};
