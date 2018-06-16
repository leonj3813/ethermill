from datetime import datetime

from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render

# Create your views here.

def index(request):
    return render(request, 'tokenfactory/index.html')

def create(request):
    return render(request, 'tokenfactory/createcoin.html')

def about(request):
    return render(request, 'tokenfactory/about.html')

def tx_hash(request, tran_hash):
    return render(request, 'tokenfactory/txHash.html', {"tran_hash" : tran_hash })
