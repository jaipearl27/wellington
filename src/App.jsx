import './App.css'
import ImageEditor from './components/ImageEditor'
import ImagePreview from './components/imagePreview'
import ImageCrop from './components/Modal'

function App() {
  

  return (
    <>
   <ImageEditor />
   {/* <ImageCrop/> */}
   <ImagePreview/>

    </>
  )
}

export default App
