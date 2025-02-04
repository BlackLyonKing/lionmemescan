import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const { headers } = req
  const upgradeHeader = headers.get("upgrade") || ""

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { 
      status: 400,
      headers: corsHeaders
    })
  }

  try {
    const { socket: clientSocket, response } = Deno.upgradeWebSocket(req)
    const pumpPortalSocket = new WebSocket("wss://pumpportal.fun/api/data")

    console.log("WebSocket connection established")

    pumpPortalSocket.onopen = () => {
      console.log("Connected to PumpPortal WebSocket")
      
      // Subscribe to token creation events
      pumpPortalSocket.send(JSON.stringify({
        method: "subscribeNewToken"
      }))

      // Subscribe to Raydium liquidity events
      pumpPortalSocket.send(JSON.stringify({
        method: "subscribeRaydiumLiquidity"
      }))
    }

    clientSocket.onmessage = (event) => {
      console.log("Received message from client:", event.data)
      const message = JSON.parse(event.data)
      
      // Forward subscription/unsubscription requests to PumpPortal
      if (message.method && [
        "subscribeTokenTrade",
        "subscribeAccountTrade",
        "unsubscribeNewToken",
        "unsubscribeTokenTrade",
        "unsubscribeAccountTrade"
      ].includes(message.method)) {
        pumpPortalSocket.send(JSON.stringify(message))
      }
    }

    pumpPortalSocket.onmessage = (event) => {
      console.log("Received message from PumpPortal:", event.data)
      clientSocket.send(event.data)
    }

    pumpPortalSocket.onerror = (error) => {
      console.error("PumpPortal WebSocket error:", error)
    }

    clientSocket.onerror = (error) => {
      console.error("Client WebSocket error:", error)
    }

    return response
  } catch (error) {
    console.error("WebSocket setup error:", error)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  }
})