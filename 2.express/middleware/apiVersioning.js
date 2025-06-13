export const urlVersion = (version) => (req, res, next) => {
  if(req.path.startsWith(`/api/${version}`)){
    next();
  } else {
    res.status(404).json({
      success : false,
      message :"API version not supported"
    });
  }
}

export const headerVersion = (version) => (req, res, next) => {
  if(req.get('Accept-Version') === version) {
    next();
  } else {
    res.status(404).json({
      success : false,
      message :"API version not supported"
    });
  }
}

export const contentTypeVersion = (version) => (req, res, next) => {
  const contentType = req.get('Content-Type');
  if(contentType && contentType.include(`application/vnd.api.${version}+json`)){
    next();
  } else {
    res.status(404).json({
      success : false,
      message :"API version not supported"
    });
  }
}