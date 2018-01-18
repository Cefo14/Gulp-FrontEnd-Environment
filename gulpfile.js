'use strict'

const gulp = require('gulp')

// Utileries
const multiProcess = require('gulp-multi-process');
const rename = require("gulp-rename");
const browserSync = require('browser-sync').create();
const plumber = require('gulp-plumber');
const concat = require('gulp-concat')

// Pre-Processors
const pug = require('gulp-pug') 
const sass = require('gulp-sass') 
const babel = require('gulp-babel')

// Image modifiers 
const imagemin = require('gulp-imagemin')
const pngquant = require('imagemin-pngquant')
const svgmin = require('gulp-svgmin')
const webp = require('gulp-webp')

// CSS modifiers
const uncss = require('gulp-uncss')
const autoprefixer = require('gulp-autoprefixer')
const cleanCSS = require('gulp-clean-css')

// JS modifiers
const uglify = require('gulp-uglify')

// HTML modifiers
const useref = require('gulp-useref') //css (// build:css css/app.min.css)  y js (// build:js js/app.min.js)
const htmlmin = require('gulp-htmlmin')


const dir = {
	src : 'src',
	dist : 'dist',
	nm : 'node_modules'
}

const files = { 
	CSS : [
		`${dir.nm}/bootstrap/dist/css/bootstrap.min.css`,
		`${dir.nm}/font-awesome/css/font-awesome.min.css`,
		`${dir.dist}/css/app.css`
	],
	
	mCSS : 'app.min.css',
	
	JS : [
		`${dir.nm}/jquery/dist/jquery.min.js`,
		`${dir.nm}/bootstrap/dist/js/bootstrap.min.js`,
		`${dir.dist}/js/app.js`
	],
	
	mJS : 'app.min.js',
	
	fonts : [
		`${dir.nm}/bootstrap/dist/fonts/*.*`,
		`${dir.nm}/font-awesome/fonts/*.*`
		],
	
	statics : [
		`${dir.src}/humans.txt`,
		`${dir.src}/sitemap.xml`
	]
}

const opts = {
	pug: {
		pretty: true,
		locals: {
			title: 'Titulo',
			files: files
		}
	},

	sass : { 
		outputStyle: 'compressed' 
	},

	es6 : { 
		presets : ['es2015'] 
	},

	imagemin : { 
		progressive : true,
		use : [ pngquant() ]
	},

	svgmin : { 
		plugins : [ 
			{ convertColors : false },
			{ removeAttrs : { attrs : ['fill'] } }
		]
	},
	uncss : { 
		html : [`${dir.dist}/*.html`] 
	},
	
	autoprefixer : { 
		browsers : ['last 5 versions'],
		cascade : false 
	},
	
	htmlmin : {
		collapseWhitespace: true
	},

	browserSync : {
		server: {
			baseDir: 'dist',
			index: "index.html",
			routes: {
        		'/node_modules': 'node_modules',
        		'/dist/css' : 'dist/css',
        		'/dist/js' : 'dist/js',
        		'/dist/fonts' : 'dist/fonts'
        	},
		},
		files: "dist/**/*.+(html|css|js)"
	}
}

//******************
//*   DEVELOPER    *
//******************
gulp.task('pug', () => {
	gulp
		.src(`${dir.src}/pug/*.pug`)
		.pipe(plumber())
		.pipe(pug(opts.pug))
		.pipe(rename('index.html'))
		.pipe(gulp.dest(dir.dist))
})

gulp.task('sass', () => {
	gulp
		.src(`${dir.src}/scss/*.scss`)
		.pipe(plumber())
		.pipe(sass(opts.sass))
		.pipe(rename('app.css'))
		.pipe(gulp.dest(`${dir.dist}/css`))
})

gulp.task('es6', () => {
	gulp
		.src(`${dir.src}/es6/*.js`)
		.pipe(plumber())
		.pipe(babel(opts.es6))
		.pipe(rename('app.js'))
		.pipe(gulp.dest(`${dir.dist}/js`))
})

//************************
//*   IMAGE MODIFIERS    *
//************************
gulp.task('img', () => {
	gulp
		.src(`${dir.src}/img/**/*.+(png|jpeg|jpg|gif)`)
		.pipe(plumber())
		.pipe(imagemin(opts.imagemin))
		.pipe(gulp.dest(`${dir.dist}/img`))
})

gulp.task('svg', () => {
	gulp
		.src(`${dir.src}/img/svg/**/*.svg`)
		.pipe(plumber())
		.pipe(svgmin(opts.svgmin))
		.pipe(gulp.dest(`${dir.dist}/img/svg`))
})

gulp.task('webp', () => {
	gulp
		.src(`${dir.src}/img/**/*.+(png|jpeg|jpg)`)
		.pipe(plumber())
		.pipe(webp())
		.pipe(gulp.dest(`${dir.dist}/img/webp`))
})

//*********************
//*   STATIC FILES    *
//*********************
gulp.task('fonts', () => {
	gulp
		.src(files.fonts)
		.pipe(plumber())
		.pipe(gulp.dest(`${dir.dist}/fonts`))
})

gulp.task('statics', () => {
	gulp
		.src(files.statics)
		.pipe(plumber())
		.pipe(gulp.dest(dir.dist))
})

//*******************
//*   PRODUCTION    *
//*******************
gulp.task('css', () => {
	gulp
		.src(files.CSS)
		.pipe(plumber())
		.pipe(concat(files.mCSS))
		.pipe(uncss(opts.uncss))
		.pipe(autoprefixer(opts.autoprefixer))
		.pipe(cleanCSS() )
		.pipe(gulp.dest(`${dir.dist}/css`))
})

gulp.task('js', () => {
	gulp
		.src(files.JS)
		.pipe(plumber())
		.pipe(concat(files.mJS))
		.pipe(uglify())
		.pipe(gulp.dest(`${dir.dist}/js`))
})

gulp.task('html', () => {
	gulp
		.src(`${dir.dist}/*.html`)
		.pipe(plumber())
		.pipe(useref())
		.pipe(htmlmin(opts.htmlmin))
		.pipe(gulp.dest(dir.dist))
})

//*****************
//*   WATCHERS    *
//*****************
gulp.task('browserSync', () => {
	browserSync.init(opts.browserSync)
})

gulp.task('watch:pug', () => {
	gulp.watch(`${dir.src}/pug/*.pug`, ['pug'])
})

gulp.task('watch:sass', () => {
	gulp.watch(`${dir.src}/scss/*.scss`, ['sass'])
})

gulp.task('watch:es6', () => {
	gulp.watch(`${dir.src}/js/*.js`, ['es6'])
})

gulp.task('watch:dev', () => {
	multiProcess(['browserSync', 'watch:pug', 'watch:sass', 'watch:es6']);
})