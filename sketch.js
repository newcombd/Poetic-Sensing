const AIO_USERNAME = "newcombd"
const AIO_KEY = "aio_FQeU17dSKImwPJYuqDN34HSxYhJn"

    let values = []
    let times = []
    let circleIndex = 0
    let circleGo = false

    let osc
    let env
    let frequency


async function setup() {
    let canvas = createCanvas(1425, 800)

     // fetch our data
    let data = await fetchData("sensor-test")      // note the "await" keyword
    print(data)

    // re-sort the array by time
    data.sort((a, b) => (a.created_at > b.created_at) ? 1 : -1)

    // make a new array with just the sensor values
    // divide by the max value to "normalize" them to the range 0-1
    for (let datum of data) {
        values.push(datum.value / 4095)
    }

    // make a new array with just the timestamp
    // this one is trickier to normalize so we'll do it separately
    for (let datum of data) {
        // convert the string into a numerical timestamp
        let time = Date.parse(datum.created_at) / 1000
        times.push(time)
    }

    // normalize the times to between 0 and 1
    let start_time = min(times)
    let stop_time = max(times)
    for (let i=0; i<times.length; i++) {
        let time = times[i]
        times[i] = (time - start_time) / (stop_time - start_time)
    }

    frameRate(5)

    osc = new p5.Oscillator()
    osc.setType("sine")

    noise_env = new p5.Envelope()
    noise_env.setADSR(.2, .1, .1, .5)

} //end of setup

async function draw() { // note "async" keyword
   
    // now we can draw

    background(255)


    // this one is just a breakpoint line, similar to the adafruit feed page
    // note that to get the y axis right, we have to flip it by subtracting from 1
    stroke(0)
    strokeWeight(1)
    for (let i=1; i<values.length; i++) {   // starting at 1, not 0
        let x1 = times[i-1] * width
        let y1 = (1 - values[i-1]) * height
        let x2 = times[i] * width
        let y2 = (1 - values[i]) * height
        line(x1, y1, x2, y2)
    }


//Circle variables and code ---------------------------------------------------------------
    let x = times[circleIndex] * width
    let y = (1 - values[circleIndex]) * height
    let frequency = map(y, height*2, 0, 2000, 50)

    fill(255,0,0)

text(circleIndex, width-width/4, height/6)
        text(frequency, width-width/2, height/6)
        rect(1,1,40,40)

if (circleGo == true) {
    circleIndex += 1
    circle(x, y, 5)


    osc.freq(frequency)

    osc.start()
    osc.amp(env)
    env.triggerAttack()

} 

if (circleIndex >= times.length) {
    circleIndex = 0
    circleGo = false
}




} //end of Draw function



// this function fetches our data
async function fetchData(feed) {
    return await new Promise((resolve, reject) => {
        let url = `https://io.adafruit.com/api/v2/${AIO_USERNAME}/feeds/${feed}/data`
        httpGet(url, 'json', false, function(data) {
            resolve(data)
        })
    })
}


function mouseClicked() {

    circleGo = true


}

function mouseReleased() {

    env.triggerRelease()
    noise_env.triggerRelease()
   
}