/*
 *	
	使用:
		在head 标签内直接以<script type="text/javascript" src="xxxx.js"></script>的方式引用即可,之后页面左上角有一个灰色的小按钮出现,点开就行了.....在代码中同样可以使用 forin(obj) 来查看变量,但有一个限制是 只能在 加载 body 标签之中或之后使用 forin 函数
	
	属性: 	
	forin.useSort:Boolean	 
		是否对结果排序,默认为true,如果不想对查看结果排序则在输入框内输入 forin.useSort=false 即可
	
	函数:
	forin(obj:*):void
			以 for in 的方式对 obj 进行遍历,obj可以是任何参数(变量,表达式,正则,函数......)
			   
			   
			   
	Note:		   	
     	因为在 forin 函数内部使用了正则表达式,因此 RegExp 的属性值不确定,因此请使用其它方式检测RegExp.lastIndex 或RegExp.rightContext ......之类的值

URL:	javascript:void((function(url,head,script){head=document.getElementsByTagName('head')[0]||document.documentElement;script=document.createElement('script');if(window['forin']){return}script.src=url;script.onload=script.onreadystatechange=function(){if(!script.readyState||script.readyState=='loaded'||script.readyState=='complete'){window['forin']('5515544@qq.com');script.onload=script.onreadystatechange=null;if(head&&script.parentNode){head.removeChild(script)}}};head.insertBefore(script,head.firstChild)})('http://forin.googlecode.com/svn-history/r2/trunk/forin_package.js'))
	
 */
(function(window,undef){	  
		var _static,			// Reference to forin	
			
			_dom,				// Map.<String-->Node>
			
			_args,				// Map.<string-->*>
			
			_fn=new Object();	// Map.<String-->Function>
			
		_args={
				'visible'	:	false, 		// 窗口是否可见
				'ontmp'		:	false,		// 是否使用临时变量(forin.tmp)的值
				'ready'		:	false,		// 文档加载就绪
				'h'			:	200
			  };	
			
		if(window.forin){
			return;
		};
		
		_static=window.forin=function(obj)/* void */
		{
		 	!_args.ready && ready();
			
			 _args.ontmp=true;
			
			_fn.main(obj);
		};
		/*
		 *	forin用于直接变量,forin.input 则从 输入框解释字符串
		 */
		_static.input=function()/*void*/
		{
			var str;
				str=_dom.input.value.replace(/^\s+|\s+$/g,'')	// 清除空格
										.replace(/;+$/,'')  	// 清除 ; 符号
			
			
			;if(str){	
				//简单判断输入框里是否是函数
				_args.ontmp=str.charAt( str.length-1 )==')'? true :	false;
				_fn.main( str	,	true  );
			}
		};
		/*
		 *	这个方法由内部使用，用于 "点击链"
		 */
		_static.clickA=function(a)/*void*/
		{
			var k;
			k=/\D/.test(a.title) ? a.title : '['+a.title+']';
			if(!_args.ontmp){
				_dom.input.value=_dom.input.value+(/\[/.test(k) ? k : '.'+k)
			}else{
				_dom.input.value='forin.tmp'+(/\[/.test(k) ? k : '.'+k)
			}
			this.input()
		};
		/*
		 *	是否使用 排序　输出
		 */
		_static.useSort=true;
		
		/*
		 *	临时变量存储区
		 */
		_static.tmp=null;
		
		//+---------------------------
		//+		一些主要的方法
		//+---------------------------
		_fn.write=function(arr/*Array.<String>*/)/* void */
		{
			if(_static.useSort)
				arr.sort(arguments.callee.sortby);
			_dom.out.innerHTML=arr.length ? arr.join('<br />') : ''
		};
			_fn.write.sortby=function(a,b)
			{	
				var p1;
				var p2;
				var pat=/^\[(\d+)\]/;
				
				p1=pat.exec(a);
				if(p1)
				{	
					p2=pat.exec(b);
					if(p2)
					{
						a=Number(p1[1]);
						b=Number(p2[1]);	
					}
				}
				return a>b ?1 : -1
			};
		//-----------------------------
		_fn.warpErr=function(err/*Error*/,c/*Color String*/)/*html string*/
		{
			c=c || '#ff0000';
			return '<font color="'+c+'">'+err.name+' ---> '+err.message+'</font>'
		};
		
		/*
		 *	eval 字符串,并返回结果
		 */
		_fn.filter=function(str/*:String*/)/* * */
		{
			var ret;	
			if(str)
				switch(str.charAt(0))
				{
					case '#':	str=str.slice(1);
								ret=/\.|\[/.test(str) ? (new Function('return window.document.getElementById("'+RegExp.leftContext+'")'+RegExp.lastMatch+RegExp.rightContext))():
													window.document.getElementById(str);				
								break;
					default:	ret=(new Function('return '+str) )();
								break;
				}
			if(ret===undef)	
				throw new Error('未定义 或者 调用的函数无返回值');
			return ret	
		};
		//+----------------------------
		//+			主封装对象
		//+----------------------------
		_fn.warp=function(obj)/*Array.<html String>*/
		{
			var ret=[],
				self=arguments.callee;
			
			if(_args.ontmp)
				window.forin.tmp=obj;
			if(!obj)	
			{// 过滤出 null false undefined 0 NaN
				ret.push(typeof obj!='string' ? String(obj) : '""');
			}else{
					switch( self.ctype(obj) )
					{
						case 1:
								ret.push( self.rep(obj) );
								break;
						case 2:
								for(var i in obj)
									try{
										ret.push( self.se(i,obj[i]) );
									  }catch(e)
										 {
											ret.push( this.warpErr(e) );	
										 }
								// 如果 i === undefind 表明 obj为空或无法遍历		 
								!i && ret.push(this.warpErr({'name':obj,'message':'空的对象 ,或者IE下系统特殊对象(无法使用for in 进行遍历)'}));		 
								break;
						case 3:
						case 4:
								ret.push(obj);
								break;
					}// end switch
				}
			return ret;// return Array
		};
			// ------  类型检察 -------
			_fn.warp.ctype=function(obj)/* uint */
			{
				var r=3;
					　　switch(typeof obj)
						{
							case 'string'	:	r=1;
											break;
							case 'object'	:	(obj.constructor!=window.RegExp) && (r=2);
												break;				
							case 'function'	:	r=4;
											break;
							default	:	//r=3;		//Number ,true , RegExp ,
											break;
						}
				return r
			};
			// --------深度２ warp--------
			_fn.warp.se=function(k/* String */,v/* * */)/* Array.<html String> */
			{
				var ret=[];
				
				// typeof k String or [Number]
				ret.push(/\D/.test(k) ? k : '['+k+']');
				
				if(!v)
					ret.push(typeof v!='string' ? String(v) : '""');
				else{
						switch( this.ctype(v) )
						{
							case 1: ret.push(v.length<60 ? this.rep(v) : this.a(k,'') );
								
									break;
							case 2:
							case 4: // ret[0]== k || [Number]
									ret.push( this.a( ret[0], v ) );
									break;
							case 3:
									ret.push(v);
									break;
							
						}// end switch
					
					}// end else
				return ret.join(' ---> ')	// return String
			};
			// --------String replace---------
			_fn.warp.rep=function(s/*html String*/)/*html String*/
			{
				return s.replace(/</g,'&lt;')
							.replace(/>/g,'&gt;')
								.replace(/\x20{2}/g,'\x20\xA0')
									.replace(/\n/g,'<br />')
			};
			// 创建 链接 <a>String</a> 
			_fn.warp.a=function(k,v)
			{
				return '<a href="javascript:void(0)" title="'+k+'" onclick="forin.clickA(this)">'+this.win.Object.prototype.toString.call(v)+'</a>'	
			};//
			// speed reference window
			_fn.warp.win=window;
		
		// 			主入口函数
		_fn.main=function(obj/* * */,onFilter/*Boolean=false*/)// :void
		{	
			try
			{
				
				this.write( this.warp( onFilter ? this.filter(obj) : obj ) )
			}catch(err)
			 {
			 	
			  	this.write( [  this.warpErr(err) ]  )
			 }
		
		};
		
		//	 readyHandelr
		function ready()/*void*/
		{
			if(!_args.ready){
				cfgEvent(	_dom=initDOM() );
				_args.ready=true;
				ready=cfgEvent=initDOM=null
			}
		}
		
		function cfgEvent(o/*Map.<String-->Node>*/)/*void*/
		{
			if(window.addEventListener){// W3C
				o.onoff.addEventListener('click',s,false); // 切换显示和隐藏
				o.input.addEventListener('keydown',k,false); // input 直接回车
				o.back.addEventListener('click',b,false); // 点击 后退
				
				window.addEventListener('resize',r2,false); // 重置窗口大小
				window.addEventListener('scroll',r2,false); // scroll event
				window.addEventListener('scroll',r1,false);
			
			}else{		// MSIE
					o.onoff.attachEvent('onclick',s);
					o.input.attachEvent('onkeydown',k);
					o.back.attachEvent('onclick',b);
					window.attachEvent('onresize',r2);
					window.attachEvent('onscroll',r2);
					window.attachEvent('onscroll',r1);
				window.attachEvent('onunload',function(){// 解除事件
												o.onoff.detachEvent('onclick',s);
												o.input.detachEvent('onkeydown',k);
												o.back.detachEvent('onclick',b);
												window.detachEvent('onresize',r2);
												window.detachEvent('onscroll',r2);
												window.detachEvent('onscroll',r1);
												window.detachEvent('onunload',arguments.callee);
								
					});
			}
			/*****
			 * 所有 EventHandler 都是　内部函数
			 ***/	 
			function r1(e)
			{
					var doc=window.document.documentElement;
					var body=window.document.body;
					var obj=o.onoff;
					obj.style.top=((doc && doc.scrollTop || body && body.scrollTop || 0)+2)+'px';
					obj.style.left=((doc && doc.scrollLeft || body && body.scrollLeft || 0)+2)+'px';
			};
			
			function r2(e)
			{	
				if(_args['visible'])
				{
					var doc=window.document.documentElement;
					var body=window.document.body;
					var obj=o.shell;
					obj.style.top=((doc.clientHeight || body.clientHeight) +(doc && doc.scrollTop || body && body.scrollTop || 0)-_args.h-30)+'px';
				}
			};
			// -----------显示和隐藏------switch----------
			
			function s(e)
			{
				if(o.shell.style.display!='block'){
					_args['visible']=true;
					r2(null);
					o.shell.style.display='block';
					o.input.focus();
					o.onoff.value='To Hide';
				}else{
					o.shell.style.display='none';
					o.onoff.value='To Show';
					_args['visible']=false
				}
				e.cancelBubble=true;
				return false
			}
			
		
			//---------input 的回车事件---keyboerd----------
			function k(e)
			{
				e.cancelBubble=e.keyCode!=13;
				!e.cancelBubble && _static.input();
				return e.cancelBubble;
			}
			
			//----------后退事件---back off-----------------
			function b(e)
			{
				var p,
					s=o.input.value;
				if(s!='forin.tmp')
				{
					p=Math.max(s.lastIndexOf('.'),s.lastIndexOf('['));
					if(p^-1)// if(p!=-1)
					  (o.input.value=s.slice(0,p)) && _static.input();
				}
				e.cancelBubble=true;
			}
			
			r1(null)	// 把位置定好
		}// end configureListeners
		
		function initDOM()
		{
			var onoff,
				i=0,
				o=[];
			var doc=this.document;
			var body=doc.body;
				
			o[0]=doc.createElement('div');	// shell
			o[1]=doc.createElement('input');	// input
			o[2]=doc.createElement('input');	// back 
			o[3]=doc.createElement('div');	// out
			onoff=doc.createElement('input');	// on-off
			o[1].type	=	onoff.type	=	'button';
			o[1].value=' <-- ';
			o[2].type='text';
			o[2].size='65';

			onoff.value=' forin ';
			
			onoff.style.cssText='position:absolute;  border-width:1px; width:58px; height:18px; font:normal 11px/14px "Courier New"; cursor:pointer';
			o[0].style.cssText='position:absolute;  display:none; left:10%;  width:80%; background:#DDDDDD; border:#999999 1px solid; text-align:left;';
			
			o[2].style.cssTest='border-width:1px; height:22px';
			o[1].style.cssText='font:bold 14px/20px "Courier New"; margin-left:0; border-width:1px; height:22px;  cursor:pointer';
			o[3].style.cssText='background:#FFF; color:#000; margin-top:1px;   height:200px ; overflow:auto; font:normal 14px/1.4 "黑体","宋体"; border-top:#999 1px solid;letter-spacing:normal';
			while(i++^3)
				o[0].appendChild(o[i]);
			
			body.appendChild(onoff);
			body.appendChild(o[0]);
			
			o[4]=onoff;
			
			return {'shell'		:o[0],
					'back'		:o[1],
					'input'		:o[2],
					'out'		:o[3],
					'onoff'		:o[4]
				   }
		}
		
		function bindReady(func){// 摘自Jquery 部分代码
			
			
			if(window.addEventListener){
				window.document.addEventListener('DOMContentLoaded',function(){
								this.removeEventListener('DOMContentLoaded',arguments.callee,false);			
								func()
																			 },false)
			}else{
					window.document.attachEvent('onreadystatechange',function(){
									if(this.document.readyState=='complete'){// this--->window
										this.document.detachEvent('onreadystatechange',arguments.callee);
										func()
									}
												})
				 
			}// end else	 
				 
		}//----end bindReady----
		/*
		 *		 window.ready
		 */
		bindReady(ready);
})(window);