exports.showStaffLogin = async(req, res) => {
  if (req.isAuthenticated?.()) {
    if (['admin', 'teacher'].includes(req.user?.usertype)) {
      return res.redirect('/Dashboard');
    }

    return req.logout(() => res.render('./teacher/login'));
  }

  res.render('./teacher/login');
}

exports.showStudentLogin = async(req, res) => {
  if (req.isAuthenticated?.()) {
    if (req.user?.usertype === 'pupil') {
      return res.redirect('/Dashboard');
    }

    return req.logout(() => res.render('./pupil/login'));
  }

  res.render('./pupil/login');
}



exports.logout = async(req, res) => {
  req.logout(error => {
    if (error) {
      return res.status(500).send('Unable to logout.');
    }

    req.session.destroy(sessionError => {
      if (sessionError) {
        return res.status(500).send('Unable to logout.');
      }

      res.redirect('/');
    });
  });
}